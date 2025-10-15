import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // Crear pedido
  create(data: { project: string; clientId: number; total: number; status?: string }) {
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
  update(id: number, data: { project?: string; total?: number; status?: string }) {
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
}
