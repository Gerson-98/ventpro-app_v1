import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  // Crear cliente
  create(data: { name: string; phone?: string; email?: string; address?: string }) {
    return this.prisma.clients.create({ data });
  }

  // Obtener todos
  findAll() {
    return this.prisma.clients.findMany({
      include: { orders: true }, // muestra pedidos del cliente
    });
  }

  // Obtener uno
  findOne(id: number) {
    return this.prisma.clients.findUnique({
      where: { id },
      include: { orders: true },
    });
  }

  // Actualizar
  update(id: number, data: { name?: string; phone?: string; email?: string; address?: string }) {
    return this.prisma.clients.update({
      where: { id },
      data,
    });
  }

  // Eliminar
  remove(id: number) {
    return this.prisma.clients.delete({ where: { id } });
  }
}
