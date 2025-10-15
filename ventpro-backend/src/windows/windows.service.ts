import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WindowsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.windows.findMany({
      include: {
        window_type: true,
        pvcColor: true,
        glassColor: true,
        order: {
          include: { clients: true },
        },
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.windows.findUnique({
      where: { id },
      include: {
        window_type: true,
        pvcColor: true,
        glassColor: true,
        order: {
          include: { clients: true },
        },
      },
    });
  }

  async create(data: any) {
    const {
      width_cm,
      height_cm,
      window_type_id,
      color_id,
      glass_color_id,
      order_id,
    } = data;

    // Obtener el nombre del tipo de ventana (como lo usabas antes)
    const type = await this.prisma.window_types.findUnique({
      where: { id: Number(window_type_id) },
      select: { name: true },
    });
    const windowTypeName = type?.name ?? '';

    // ⚖️ Recalcular medidas exactamente como antes
    const { hojaAncho, hojaAlto, vidrioAncho, vidrioAlto } =
      calculateMeasurements(
        windowTypeName,
        Number(width_cm),
        Number(height_cm),
      );

    return this.prisma.windows.create({
      data: {
        width_cm: Number(width_cm),
        height_cm: Number(height_cm),
        hojaAncho,
        hojaAlto,
        vidrioAncho,
        vidrioAlto,
        order: { connect: { id: Number(order_id) } },
        window_type: { connect: { id: Number(window_type_id) } },
        pvcColor: { connect: { id: Number(color_id) } },
        glassColor: { connect: { id: Number(glass_color_id) } },
      },
      include: {
        order: { include: { clients: true } },
        window_type: true,
        pvcColor: true,
        glassColor: true,
      },
    });
  }

  async updateWindow(id: number, data: any) {
    // ✅ Aceptar ambos formatos camelCase y snake_case
    const windowTypeId =
      (data.window_type_id ?? data.windowTypeId)
        ? Number(data.window_type_id ?? data.windowTypeId)
        : undefined;
    const pvcColorId =
      (data.color_id ?? data.pvcColorId)
        ? Number(data.color_id ?? data.pvcColorId)
        : undefined;
    const glassColorId =
      (data.glass_color_id ?? data.glassColorId)
        ? Number(data.glass_color_id ?? data.glassColorId)
        : undefined;

    // 🔹 Determinar nombre del tipo de ventana
    let windowTypeName = data.windowTypeName || data.window_type_name || '';
    if (!windowTypeName && windowTypeId) {
      const type = await this.prisma.window_types.findUnique({
        where: { id: windowTypeId },
        select: { name: true },
      });
      windowTypeName = type?.name || '';
    }

    // 🔹 Buscar la ventana existente
    const existing = await this.prisma.windows.findUnique({ where: { id } });
    if (!existing) throw new Error(`No se encontró la ventana con id ${id}`);

    const width = data.width_cm ? Number(data.width_cm) : existing.width_cm;
    const height = data.height_cm ? Number(data.height_cm) : existing.height_cm;

    // 🔹 Recalcular hoja y vidrio
    const { hojaAncho, hojaAlto, vidrioAncho, vidrioAlto } =
      calculateMeasurements(windowTypeName, width, height);

    return this.prisma.windows.update({
      where: { id },
      data: {
        width_cm: width,
        height_cm: height,
        hojaAncho,
        hojaAlto,
        vidrioAncho,
        vidrioAlto,
        ...(windowTypeId
          ? { window_type: { connect: { id: windowTypeId } } }
          : {}),
        ...(pvcColorId ? { pvcColor: { connect: { id: pvcColorId } } } : {}),
        ...(glassColorId
          ? { glassColor: { connect: { id: glassColorId } } }
          : {}),
      },
      include: {
        order: { include: { clients: true } },
        window_type: true,
        pvcColor: true,
        glassColor: true,
      },
    });
  }

  // ✅ DUPLICAR VENTANA COMPLETA CON RELACIONES (corrigido para snake_case)
  async duplicateWindow(id: number) {
    const original = await this.prisma.windows.findUnique({
      where: { id },
      include: {
        window_type: true,
        pvcColor: true,
        glassColor: true,
      },
    });

    if (!original) throw new Error('Ventana no encontrada para duplicar');

    // Quitamos propiedades no duplicables
    const { id: _, createdAt, updatedAt, ...rest } = original;

    // Creamos la nueva ventana con campos mapeados según tu modelo real
    const duplicated = await this.prisma.windows.create({
      data: {
        order_id: rest.order_id, // 👈 tu campo real
        width_cm: rest.width_cm,
        height_cm: rest.height_cm,
        window_type_id: rest.window_type_id, // 👈 tu campo real
        color_id: rest.color_id, // 👈 tu campo real
        glass_color_id: rest.glass_color_id, // 👈 tu campo real
        hojaAncho: rest.hojaAncho,
        hojaAlto: rest.hojaAlto,
        vidrioAncho: rest.vidrioAncho,
        vidrioAlto: rest.vidrioAlto,
      },
      include: {
        window_type: true,
        pvcColor: true,
        glassColor: true,
      },
    });

    return duplicated;
  }

  async remove(id: number) {
    return this.prisma.windows.delete({ where: { id } });
  }
}

function calculateMeasurements(
  windowType: string,
  width: number,
  height: number,
) {
  let hojaAncho = 0;
  let hojaAlto = 0;
  let vidrioAncho = 0;
  let vidrioAlto = 0;

  switch (windowType.toUpperCase()) {
    case 'VENTANA CORREDIZA 2 HOJAS 55 CM MARCO 45 CM':
      hojaAncho = width / 2;
      hojaAlto = height - 7.2;
      vidrioAncho = hojaAncho - 8.5;
      vidrioAlto = hojaAlto - 8.5;
      break;

    case 'VENTANA CORREDIZA 3 HOJAS 55 CM MARCO 45 CM LATERALES OCULTOS':
      hojaAncho = (width + 6) / 4;
      hojaAlto = height - 7.2;
      vidrioAncho = hojaAncho - 8.5;
      vidrioAlto = hojaAlto - 8.5;
      break;

    case 'VENTANA CORREDIZA 3 HOJAS 55 CM MARCO 45 CM 3 IGUALES':
      hojaAncho = (width + 6) / 3;
      hojaAlto = height - 7.2;
      vidrioAncho = hojaAncho - 8.5;
      vidrioAlto = hojaAlto - 8.5;
      break;

    case 'VENTANA CORREDIZA 4 HOJAS 55 CM MARCO 45 CM':
      hojaAncho = (width + 6) / 4;
      hojaAlto = height - 7.2;
      vidrioAncho = hojaAncho - 8.5;
      vidrioAlto = hojaAlto - 8.5;
      break;

    case 'MARCO FIJO':
      hojaAncho = width;
      hojaAlto = height;
      vidrioAncho = hojaAncho - 8.5;
      vidrioAlto = hojaAlto - 8.5;
      break;

    case 'VENTANA PROYECTABLE':
      hojaAncho = width - 6.3;
      hojaAlto = height - 6.3;
      vidrioAncho = hojaAncho - 8.5;
      vidrioAlto = hojaAlto - 8.5;
      break;

    case 'VENTANA ABATIBLE DE 1 HOJA':
      hojaAncho = width - 4.5;
      hojaAlto = height - 4.5;
      vidrioAncho = hojaAncho - 16.7;
      vidrioAlto = hojaAlto - 16.7;
      break;

    default:
      hojaAncho = width;
      hojaAlto = height;
      vidrioAncho = width;
      vidrioAlto = height;
  }

  return {
    hojaAncho: Number(hojaAncho.toFixed(1)),
    hojaAlto: Number(hojaAlto.toFixed(1)),
    vidrioAncho: Number(vidrioAncho.toFixed(1)),
    vidrioAlto: Number(vidrioAlto.toFixed(1)),
  };
}
