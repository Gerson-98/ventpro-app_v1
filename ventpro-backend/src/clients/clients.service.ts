import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  create(data: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  }) {
    return this.prisma.clients.create({ data });
  }

  findAll() {
    return this.prisma.clients.findMany({
      include: { orders: true },
    });
  }

  findOne(id: number) {
    return this.prisma.clients.findUnique({
      where: { id },
      include: { orders: true },
    });
  }

  update(
    id: number,
    data: { name?: string; phone?: string; email?: string; address?: string },
  ) {
    return this.prisma.clients.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.clients.delete({ where: { id } });
  }
}
