import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  catalogo_perfiles,
  orders,
  pvcColor,
  window_types,
  windows,
} from '@prisma/client';

type ProfileRequirement = {
  pvcColor: string;
  profileType: string;
  profileName: string;
  requiredLength: number;
};

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generateProfilesReport(orderId: number) {
    const order = await this.prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        windows: {
          include: {
            window_type: true,
            pvcColor: true,
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

    const allProfiles: ProfileRequirement[] = [];

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
            // ✨ CORRECCIÓN: Pasamos el tipo de perfil a la función de cálculo
            requiredLength: this.calculateProfileLength(
              profile.rule,
              profile.type,
              window,
            ),
          });
        }
      }
    }

    const reportMap = new Map<
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
      if (!reportMap.has(key)) {
        reportMap.set(key, {
          pvcColor: profile.pvcColor,
          profileType: profile.profileType,
          profileName: profile.profileName,
          totalLength: 0,
        });
      }
      reportMap.get(key)!.totalLength += profile.requiredLength;
    }

    const finalReport = Array.from(reportMap.values()).map((item) => {
      const barras = item.totalLength / 580;
      return {
        colorPvc: item.pvcColor,
        tipoPerfil: item.profileType,
        nombrePerfil: item.profileName,
        barrasNecesarias: Number(barras.toFixed(4)),
      };
    });

    return finalReport.sort(
      (a, b) =>
        a.colorPvc.localeCompare(b.colorPvc) ||
        a.tipoPerfil.localeCompare(b.tipoPerfil),
    );
  }

  /**
   * ✨ FUNCIÓN DE CÁLCULO TOTALMENTE CORREGIDA
   */
  private calculateProfileLength(
    rule: string,
    profileType: string,
    window: windows,
  ): number {
    // Determina qué medidas usar basándose en el TIPO de perfil
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
    // Aquí se podrían añadir más reglas como "SUMAR ANCHO", etc.

    return length * multiplier;
  }
}
