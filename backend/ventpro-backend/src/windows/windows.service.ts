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
    if ('id' in data) delete data.id;
    const orderId = Number(data.orderId);
    const width_cm = Number(data.width_cm);
    const height_cm = Number(data.height_cm);
    const windowTypeId = data.windowTypeId ? Number(data.windowTypeId) : undefined;
    const pvcColorId = data.pvcColorId ? Number(data.pvcColorId) : undefined;
    const glassColorId = data.glassColorId ? Number(data.glassColorId) : undefined;

    const windowTypeName = data.windowTypeName || data.window_type_name || '';

    const { hojaAncho, hojaAlto, vidrioAncho, vidrioAlto } = calculateMeasurements(
      windowTypeName,
      width_cm,
      height_cm,
    );

    return this.prisma.windows.create({
      data: {
        width_cm,
        height_cm,
        hojaAncho,
        hojaAlto,
        vidrioAncho,
        vidrioAlto,
        order: { connect: { id: orderId } },
        ...(windowTypeId ? { window_type: { connect: { id: windowTypeId } } } : {}),
        ...(pvcColorId ? { pvcColor: { connect: { id: pvcColorId } } } : {}),
        ...(glassColorId ? { glassColor: { connect: { id: glassColorId } } } : {}),
      },
      include: {
        order: { include: { clients: true } },
        window_type: true,
        pvcColor: true,
        glassColor: true,
      },
    });
  }

  async update(id: number, data: any) {
    const windowTypeId = data.windowTypeId ? Number(data.windowTypeId) : undefined;
    const pvcColorId = data.pvcColorId ? Number(data.pvcColorId) : undefined;
    const glassColorId = data.glassColorId ? Number(data.glassColorId) : undefined;

    return this.prisma.windows.update({
      where: { id },
      data: {
        ...(data.width_cm !== undefined ? { width_cm: Number(data.width_cm) } : {}),
        ...(data.height_cm !== undefined ? { height_cm: Number(data.height_cm) } : {}),
        ...(windowTypeId ? { window_type: { connect: { id: windowTypeId } } } : {}),
        ...(pvcColorId ? { pvcColor: { connect: { id: pvcColorId } } } : {}),
        ...(glassColorId ? { glassColor: { connect: { id: glassColorId } } } : {}),
      },
      include: {
        order: { include: { clients: true } },
        window_type: true,
        pvcColor: true,
        glassColor: true,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.windows.delete({ where: { id } });
  }
}

function calculateMeasurements(windowType: string, width: number, height: number) {
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
