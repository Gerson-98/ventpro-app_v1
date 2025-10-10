import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WindowTypesService {
  constructor(private prisma: PrismaService) {}

  create(data: { name: string; description?: string }) {
    return this.prisma.window_types.create({ data });
  }

  findAll() {
    return this.prisma.window_types.findMany();
  }

  findOne(id: number) {
    return this.prisma.window_types.findUnique({ where: { id } });
  }

  update(id: number, data: { name?: string; description?: string }) {
    return this.prisma.window_types.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.window_types.delete({ where: { id } });
  }
}
