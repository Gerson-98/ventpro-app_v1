import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  RescheduleOrderDto,
  UpdateOrderStatusDto,
} from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // Crear pedido
  create(data: {
    project: string;
    clientId: number;
    total: number;
    status?: string;
  }) {
    return this.prisma.orders.create({
      data: {
        project: data.project,
        total: Number(data.total),
        status: data.status || 'en proceso',
        clients: {
          connect: { id: Number(data.clientId) },
        },
      },
      include: { clients: true, windows: true }, // ✅ incluir ventanas en la creación también
    });
  }

  // Obtener todos los pedidos
  findAll() {
    return this.prisma.orders.findMany({
      include: {
        clients: true,
        _count: { select: { windows: true } }, // ✅ útil para mostrar cuántas ventanas tiene cada pedido
      },
      orderBy: { id: 'desc' },
    });
  }

  // ✅ Obtener un pedido con sus ventanas asociadas
  findOne(id: number) {
    return this.prisma.orders.findUnique({
      where: { id },
      include: {
        clients: true,
        windows: {
          include: {
            window_type: true,
            pvcColor: true,
            glassColor: true,
          },
        },
      },
    });
  }

  // Actualizar pedido
  update(
    id: number,
    data: { project?: string; total?: number; status?: string },
  ) {
    return this.prisma.orders.update({
      where: { id },
      data: {
        project: data.project,
        total: data.total ? Number(data.total) : undefined,
        status: data.status,
      },
      include: { clients: true, windows: true },
    });
  }

  // Eliminar pedido
  remove(id: number) {
    return this.prisma.orders.delete({
      where: { id },
    });
  }

  async findScheduled() {
    return this.prisma.orders.findMany({
      where: {
        // El filtro clave: solo trae pedidos donde la fecha de inicio NO sea nula.
        installationStartDate: {
          not: null,
        },
      },
      // Seleccionamos solo los campos que el calendario necesita para ser más eficiente.
      select: {
        id: true,
        project: true, // Esto será el "título" del evento en el calendario.
        installationStartDate: true, // Fecha de inicio del evento.
        installationEndDate: true, // Fecha de fin del evento.
        status: true, // Útil para, en el futuro, colorear los eventos.
      },
      orderBy: {
        installationStartDate: 'asc', // Ordenamos los eventos por fecha.
      },
    });
  }
  async reschedule(id: number, rescheduleOrderDto: RescheduleOrderDto) {
    const { installationStartDate, installationEndDate } = rescheduleOrderDto;

    // Primero, verificamos que el pedido exista para dar un error claro.
    const order = await this.prisma.orders.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Pedido con ID #${id} no encontrado.`);
    }

    // Actualizamos el pedido con las nuevas fechas.
    return this.prisma.orders.update({
      where: { id },
      data: {
        installationStartDate: new Date(installationStartDate),
        installationEndDate: new Date(installationEndDate),
      },
    });
  }

  async updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto) {
    const { status } = updateOrderStatusDto;

    // Verificamos que el pedido exista para dar un error claro.
    const order = await this.prisma.orders.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Pedido con ID #${id} no encontrado.`);
    }

    // Actualizamos únicamente el estado del pedido.
    return this.prisma.orders.update({
      where: { id },
      data: {
        status: status,
      },
    });
  }
}
