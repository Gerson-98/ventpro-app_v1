import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
      price,
      window_type_id,
      color_id,
      glass_color_id,
      order_id,
    } = data;

    // 🔄 MODIFICADO: Llamamos a la nueva función de cálculo
    const { hojaAncho, hojaAlto, vidrioAncho, vidrioAlto } =
      await this.calculateWindowMeasurements(
        Number(window_type_id),
        Number(width_cm),
        Number(height_cm),
      );

    return this.prisma.windows.create({
      data: {
        width_cm: Number(width_cm),
        height_cm: Number(height_cm),
        price: 0,
        hojaAncho, // 👈 Valores del nuevo cálculo
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
    const existing = await this.prisma.windows.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`No se encontró la ventana con id ${id}`);
    }

    const windowTypeId = data.window_type_id
      ? Number(data.window_type_id)
      : existing.window_type_id;
    const width = data.width_cm ? Number(data.width_cm) : existing.width_cm;
    const height = data.height_cm ? Number(data.height_cm) : existing.height_cm;
    const pvcColorId = data.color_id ? Number(data.color_id) : undefined;
    const glassColorId = data.glass_color_id
      ? Number(data.glass_color_id)
      : undefined;

    if (windowTypeId === null) {
      throw new BadRequestException(
        'El tipo de ventana (window_type_id) no puede ser nulo para realizar cálculos.',
      );
    }
    // 🔄 MODIFICADO: Recalculamos con la nueva función si cambian las dimensiones o el tipo
    const { hojaAncho, hojaAlto, vidrioAncho, vidrioAlto } =
      await this.calculateWindowMeasurements(windowTypeId, width, height);

    return this.prisma.windows.update({
      where: { id },
      data: {
        width_cm: width,
        height_cm: height,
        price: 0,
        hojaAncho, // 👈 Valores actualizados
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
        price: rest.price,
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

  async calculateWindowMeasurements(
    windowTypeId: number,
    width: number,
    height: number,
  ) {
    const calcParams = await this.prisma.window_calculations.findUnique({
      where: { window_type_id: windowTypeId },
    });

    // Si no hay parámetros, devolvemos las medidas originales sin descuento
    if (!calcParams) {
      return {
        hojaAncho: width,
        hojaAlto: height,
        vidrioAncho: width,
        vidrioAlto: height,
      };
    }

    let hojaAncho: number;

    switch (calcParams.hojaDivision) {
      case 'Mitad':
        hojaAncho = (width + calcParams.hojaMargen) / 2;
        break;
      case 'Tercio':
        hojaAncho = (width + calcParams.hojaMargen) / 3;
        break;
      case 'Cuarto':
        hojaAncho = (width + calcParams.hojaMargen) / 4;
        break;
      default: // 'Completo' u otros casos
        hojaAncho = width + calcParams.hojaMargen;
        break;
    }

    const hojaAlto = height - calcParams.hojaDescuento;
    const vidrioAncho = hojaAncho - calcParams.vidrioDescuento;
    const vidrioAlto = hojaAlto - calcParams.vidrioDescuento;

    // Redondeo a 1 decimal
    return {
      hojaAncho: Number(hojaAncho.toFixed(1)),
      hojaAlto: Number(hojaAlto.toFixed(1)),
      vidrioAncho: Number(vidrioAncho.toFixed(1)),
      vidrioAlto: Number(vidrioAlto.toFixed(1)),
    };
  }
}
