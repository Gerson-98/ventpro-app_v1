import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { windows } from '@prisma/client';

// Ya no necesitamos importar 'bin-packer'

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // =================================================================
  // FUNCIÓN PARA EL REPORTE DE RESUMEN (SIN CAMBIOS)
  // =================================================================
  async generateProfilesReport(orderId: number) {
    // ... (El código de esta función no ha cambiado en absoluto)
    const order = await this.prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        windows: {
          include: {
            window_type: true,
            pvcColor: true,
            glassColor: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(
        `El pedido con ID #${orderId} no fue encontrado.`,
      );
    }

    const profilesCatalog = await this.prisma.catalogo_perfiles.findMany();
    const catalogMap = new Map(profilesCatalog.map((p) => [p.tipo_ventana, p]));

    const allProfiles: {
      pvcColor: string;
      profileType: string;
      profileName: string;
      requiredLength: number;
    }[] = [];
    for (const window of order.windows) {
      if (!window.window_type || !window.pvcColor) continue;
      const catalogEntry = catalogMap.get(window.window_type.name);
      if (!catalogEntry) continue;

      const profiles = [
        {
          type: 'MARCO',
          name: catalogEntry.perfil_marco,
          rule: catalogEntry.regla_marco,
        },
        {
          type: 'HOJA',
          name: catalogEntry.perfil_hoja,
          rule: catalogEntry.regla_hoja,
        },
        {
          type: 'MOSQUITERO',
          name: catalogEntry.perfil_mosquitero,
          rule: catalogEntry.regla_mosquitero,
        },
        {
          type: 'BATIENTE',
          name: catalogEntry.perfil_batiente,
          rule: catalogEntry.regla_batiente,
        },
        {
          type: 'TAPAJAMBA',
          name: catalogEntry.perfil_tapajamba,
          rule: catalogEntry.regla_tapajamba,
        },
      ];

      for (const profile of profiles) {
        if (profile.name && profile.rule) {
          allProfiles.push({
            pvcColor: window.pvcColor.name,
            profileType: profile.type,
            profileName: profile.name,
            requiredLength: this.calculateProfileLength(
              profile.rule,
              profile.type,
              window,
            ),
          });
        }
      }
    }

    const profilesReportMap = new Map<
      string,
      {
        pvcColor: string;
        profileType: string;
        profileName: string;
        totalLength: number;
      }
    >();
    for (const profile of allProfiles) {
      const key = `${profile.pvcColor}|${profile.profileType}|${profile.profileName}`;
      if (!profilesReportMap.has(key)) {
        profilesReportMap.set(key, {
          pvcColor: profile.pvcColor,
          profileType: profile.profileType,
          profileName: profile.profileName,
          totalLength: 0,
        });
      }
      profilesReportMap.get(key)!.totalLength += profile.requiredLength;
    }

    const profilesReport = Array.from(profilesReportMap.values())
      .map((item) => {
        const barras = item.totalLength / 580;
        return {
          colorPvc: item.pvcColor,
          tipoPerfil: item.profileType,
          nombrePerfil: item.profileName,
          barrasNecesarias: Number(barras.toFixed(4)),
        };
      })
      .sort(
        (a, b) =>
          a.colorPvc.localeCompare(b.colorPvc) ||
          a.tipoPerfil.localeCompare(b.tipoPerfil),
      );

    const glassReportMap = new Map<
      string,
      { colorVidrio: string; totalArea: number }
    >();
    for (const window of order.windows) {
      if (
        !window.glassColor ||
        !window.window_type ||
        !window.vidrioAncho ||
        !window.vidrioAlto
      )
        continue;
      const key = window.glassColor.name;
      if (!glassReportMap.has(key)) {
        glassReportMap.set(key, { colorVidrio: key, totalArea: 0 });
      }
      const catalogEntry = catalogMap.get(window.window_type.name);
      const glassCount = catalogEntry?.cant_vidrios ?? 1;
      const glassArea = window.vidrioAncho * window.vidrioAlto;
      glassReportMap.get(key)!.totalArea += glassArea * glassCount;
    }

    const glassReport = Array.from(glassReportMap.values())
      .map((item) => {
        const planchas = item.totalArea / 35310;
        return {
          colorVidrio: item.colorVidrio,
          planchasNecesarias: Number(planchas.toFixed(4)),
        };
      })
      .sort((a, b) => a.colorVidrio.localeCompare(b.colorVidrio));

    return { profilesReport, glassReport };
  }

  // =================================================================
  // FUNCIÓN PARA EL OPTIMIZADOR DE CORTES (AHORA USA NUESTRO PROPIO ALGORITMO)
  // =================================================================
  async generateCutOptimizationReport(orderId: number) {
    const BAR_LENGTH = 580;

    const order = await this.prisma.orders.findUnique({
      where: { id: orderId },
      include: { windows: { include: { window_type: true, pvcColor: true } } },
    });

    if (!order) {
      throw new NotFoundException(`Pedido #${orderId} no encontrado.`);
    }

    const profilesCatalog = await this.prisma.catalogo_perfiles.findMany();
    const catalogMap = new Map(profilesCatalog.map((p) => [p.tipo_ventana, p]));

    // ✨ 1. SEPARAMOS LAS LISTAS DE CORTE EN DOS GRUPOS
    const individualCutList = new Map<
      string,
      { color: string; cuts: number[] }
    >();
    const combinableCutList = new Map<
      string,
      { color: string; hojaCuts: number[]; mosquiteroCuts: number[] }
    >();

    for (const window of order.windows) {
      if (!window.window_type || !window.pvcColor) continue;
      const catalogEntry = catalogMap.get(window.window_type.name);
      if (!catalogEntry) continue;

      const isSlidingType = this.isSlidingWindowType(window.window_type.name);
      const profiles = [
        {
          type: 'MARCO',
          name: catalogEntry.perfil_marco,
          rule: catalogEntry.regla_marco,
        },
        {
          type: 'HOJA',
          name: catalogEntry.perfil_hoja,
          rule: catalogEntry.regla_hoja,
        },
        {
          type: 'MOSQUITERO',
          name: catalogEntry.perfil_mosquitero,
          rule: catalogEntry.regla_mosquitero,
        },
        {
          type: 'BATIENTE',
          name: catalogEntry.perfil_batiente,
          rule: catalogEntry.regla_batiente,
        },
        {
          type: 'TAPAJAMBA',
          name: catalogEntry.perfil_tapajamba,
          rule: catalogEntry.regla_tapajamba,
        },
      ];

      for (const profile of profiles) {
        if (!profile.name || !profile.rule) continue;

        const individualCuts = this.getIndividualCuts(
          profile.rule,
          profile.type,
          window,
        );

        // Si es corrediza y es Hoja o Mosquitero, va al grupo combinable
        if (
          isSlidingType &&
          (profile.type === 'HOJA' || profile.type === 'MOSQUITERO')
        ) {
          const hojaProfileName = catalogEntry.perfil_hoja;
          const mosquiteroProfileName = catalogEntry.perfil_mosquitero;
          // Usamos una clave combinada para agrupar por par de perfiles
          const key = `${window.pvcColor.name}|${hojaProfileName}|${mosquiteroProfileName}`;

          if (!combinableCutList.has(key)) {
            combinableCutList.set(key, {
              color: window.pvcColor.name,
              hojaCuts: [],
              mosquiteroCuts: [],
            });
          }

          if (profile.type === 'HOJA') {
            combinableCutList.get(key)!.hojaCuts.push(...individualCuts);
          } else {
            // MOSQUITERO
            combinableCutList.get(key)!.mosquiteroCuts.push(...individualCuts);
          }
        } else {
          // De lo contrario, va al grupo individual
          const key = `${window.pvcColor.name}|${profile.name}`;
          if (!individualCutList.has(key)) {
            individualCutList.set(key, {
              color: window.pvcColor.name,
              cuts: [],
            });
          }
          individualCutList.get(key)!.cuts.push(...individualCuts);
        }
      }
    }

    const optimizationResult = {};

    // ✨ 2. OPTIMIZAR EL GRUPO INDIVIDUAL (LÓGICA ANTIGUA)
    for (const [key, value] of individualCutList.entries()) {
      const [color, profileName] = key.split('|');
      const optimizedBins = this.optimizeCuts(value.cuts, BAR_LENGTH);
      this.formatAndAddResult(
        optimizationResult,
        profileName,
        color,
        optimizedBins,
        BAR_LENGTH,
      );
    }

    // ✨ 3. OPTIMIZAR EL GRUPO COMBINABLE (NUEVA LÓGICA)
    for (const [key, value] of combinableCutList.entries()) {
      const [color, hojaProfileName, mosquiteroProfileName] = key.split('|');

      const { optimizedHojaBins, optimizedMosquiteroBins } =
        this.optimizeCombinedCuts(
          value.hojaCuts,
          value.mosquiteroCuts,
          BAR_LENGTH,
        );

      if (optimizedHojaBins.length > 0) {
        this.formatAndAddResult(
          optimizationResult,
          hojaProfileName,
          color,
          optimizedHojaBins,
          BAR_LENGTH,
        );
      }
      if (optimizedMosquiteroBins.length > 0) {
        this.formatAndAddResult(
          optimizationResult,
          mosquiteroProfileName,
          color,
          optimizedMosquiteroBins,
          BAR_LENGTH,
        );
      }
    }

    return optimizationResult;
  }

  private isSlidingWindowType(typeName: string): boolean {
    return typeName.toUpperCase().includes('CORREDIZA');
  }

  // ✨ NUEVO: Ayudante para formatear la salida y evitar código repetido
  private formatAndAddResult(
    resultObj: any,
    profileName: string,
    color: string,
    bins: number[][],
    barLength: number,
  ) {
    if (!resultObj[profileName]) {
      resultObj[profileName] = [];
    }
    resultObj[profileName].push({
      color: color,
      totalBars: bins.length,
      bars: bins.map((bar, index) => {
        const totalUsed = bar.reduce((sum, cut) => sum + cut, 0);
        return {
          barNumber: index + 1,
          cuts: bar.sort((a, b) => b - a), // Ordenar cortes por barra para el operario
          totalUsed: Number(totalUsed.toFixed(1)),
          waste: Number((barLength - totalUsed).toFixed(1)),
          efficiency: Number(((totalUsed / barLength) * 100).toFixed(2)),
        };
      }),
    });
  }

  // ✨ NUEVO: El cerebro de la optimización combinada
  private optimizeCombinedCuts(
    hojaCuts: number[],
    mosquiteroCuts: number[],
    barLength: number,
  ) {
    const cutFrequencies = new Map<
      number,
      { hoja: number; mosquitero: number }
    >();

    // Contar frecuencias de cada longitud de corte
    hojaCuts.forEach((cut) => {
      const freq = cutFrequencies.get(cut) || { hoja: 0, mosquitero: 0 };
      freq.hoja++;
      cutFrequencies.set(cut, freq);
    });
    mosquiteroCuts.forEach((cut) => {
      const freq = cutFrequencies.get(cut) || { hoja: 0, mosquitero: 0 };
      freq.mosquitero++;
      cutFrequencies.set(cut, freq);
    });

    const finalHojaCuts: number[] = [];
    const finalMosquiteroCuts: number[] = [];

    // Crear lotes de producción (2 hojas + 1 mosquitero)
    for (const [cutLength, freqs] of cutFrequencies.entries()) {
      const numTriples = Math.min(Math.floor(freqs.hoja / 2), freqs.mosquitero);

      if (numTriples > 0) {
        for (let i = 0; i < numTriples; i++) {
          finalHojaCuts.push(cutLength, cutLength);
          finalMosquiteroCuts.push(cutLength);
        }
        freqs.hoja -= numTriples * 2;
        freqs.mosquitero -= numTriples;
      }
    }

    // Añadir los cortes restantes que no pudieron ser triples
    for (const [cutLength, freqs] of cutFrequencies.entries()) {
      for (let i = 0; i < freqs.hoja; i++) finalHojaCuts.push(cutLength);
      for (let i = 0; i < freqs.mosquitero; i++)
        finalMosquiteroCuts.push(cutLength);
    }

    // Optimizar el empaquetado en barras para cada perfil
    const optimizedHojaBins = this.optimizeCuts(finalHojaCuts, barLength);
    const optimizedMosquiteroBins = this.optimizeCuts(
      finalMosquiteroCuts,
      barLength,
    );

    return { optimizedHojaBins, optimizedMosquiteroBins };
  }
  // ✨ NUEVO: El algoritmo de optimización First Fit Decreasing
  private optimizeCuts(cuts: number[], barLength: number): number[][] {
    // 1. Ordenar los cortes de mayor a menor
    const sortedCuts = cuts.sort((a, b) => b - a);

    const bins: { cuts: number[]; remaining: number }[] = [];

    // 2. Iterar sobre cada corte
    for (const cut of sortedCuts) {
      let placed = false;
      // 3. Intentar colocar el corte en una barra existente
      for (const bin of bins) {
        if (cut <= bin.remaining) {
          bin.cuts.push(cut);
          bin.remaining -= cut;
          placed = true;
          break;
        }
      }
      // 4. Si no cabe en ninguna, crear una nueva barra
      if (!placed) {
        bins.push({
          cuts: [cut],
          remaining: barLength - cut,
        });
      }
    }

    // Devolver solo la lista de cortes de cada barra
    return bins.map((bin) => bin.cuts);
  }

  private getIndividualCuts(
    rule: string,
    profileType: string,
    window: windows,
  ): number[] {
    const useWindowMeasures =
      profileType === 'MARCO' || profileType === 'TAPAJAMBA';
    const width = useWindowMeasures ? window.width_cm : (window.hojaAncho ?? 0);
    const height = useWindowMeasures
      ? window.height_cm
      : (window.hojaAlto ?? 0);
    const multiplierMatch = rule.match(/\*(\d+)$/);
    const multiplier = multiplierMatch ? parseInt(multiplierMatch[1], 10) : 1;
    const cuts: number[] = [];
    if (rule.includes('SUMAR ANCHO Y ALTO')) {
      const repeatCount = multiplier / 2;
      for (let i = 0; i < repeatCount; i++) {
        cuts.push(width, height);
      }
    } else if (rule.includes('SUMAR ALTO')) {
      for (let i = 0; i < multiplier; i++) {
        cuts.push(height);
      }
    }
    return cuts.map((cut) => Number(cut.toFixed(1)));
  }

  private calculateProfileLength(
    rule: string,
    profileType: string,
    window: windows,
  ): number {
    const useWindowMeasures =
      profileType === 'MARCO' || profileType === 'TAPAJAMBA';
    const currentWidth = useWindowMeasures
      ? window.width_cm
      : (window.hojaAncho ?? 0);
    const currentHeight = useWindowMeasures
      ? window.height_cm
      : (window.hojaAlto ?? 0);
    const multiplierMatch = rule.match(/\*(\d+)$/);
    const multiplier = multiplierMatch ? parseInt(multiplierMatch[1], 10) : 1;
    let length = 0;
    if (rule.includes('SUMAR ANCHO Y ALTO')) {
      length = currentWidth + currentHeight;
    } else if (rule.includes('SUMAR ALTO')) {
      length = currentHeight;
    }
    return length * multiplier;
  }
}
