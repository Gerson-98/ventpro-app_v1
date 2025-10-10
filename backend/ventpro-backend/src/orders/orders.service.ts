import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // 🔹 Obtener todos los pedidos con sus relaciones
  async findAll() {
    return this.prisma.orders.findMany({
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
      orderBy: { id: 'desc' },
    });
  }

  // 🔹 Obtener un pedido específico
  async findOne(id: number) {
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

  // 🔹 Crear un nuevo pedido
  async create(data: any) {
    console.log('🧾 Datos recibidos del frontend:', data);

    const project = data.project;
    const status = data.status || 'en proceso';
    const total = Number(data.total) || 0;
    const clientId = data.clientId ? Number(data.clientId) : null;

    // ✅ Crea el pedido en base de datos
    return this.prisma.orders.create({
      data: {
        project,
        status,
        total,
        ...(clientId ? { clients: { connect: { id: clientId } } } : {}),
      },
      include: {
        clients: true,
        windows: true,
      },
    });
  }

  // 🔹 Actualizar pedido existente
  async update(id: number, data: any) {
    return this.prisma.orders.update({
      where: { id },
      data: {
        project: data.project,
        status: data.status,
        total: data.total ? Number(data.total) : undefined,
      },
      include: {
        clients: true,
        windows: true,
      },
    });
  }

  // 🔹 Eliminar pedido
  async remove(id: number) {
    return this.prisma.orders.delete({ where: { id } });
  }
}
