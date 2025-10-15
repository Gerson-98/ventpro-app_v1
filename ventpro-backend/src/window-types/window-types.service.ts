import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WindowTypesService {
  constructor(private prisma: PrismaService) {}

  // ✨ MÉTODO 'create' MODIFICADO PARA USAR TRANSACCIONES
  async create(data: {
    name: string;
    description?: string;
    pvcColorIds?: number[];
  }) {
    const { name, description, pvcColorIds = [] } = data;

    // Usamos una transacción para garantizar que ambas operaciones (crear tipo y crear enlaces)
    // se completen correctamente o ninguna lo haga.
    return this.prisma.$transaction(async (tx) => {
      // 1. Crea el nuevo tipo de ventana
      const newWindowType = await tx.window_types.create({
        data: { name, description },
      });

      // 2. Si se proporcionaron IDs de colores, crea las asociaciones en la tabla puente
      if (pvcColorIds.length > 0) {
        const linksData = pvcColorIds.map((colorId) => ({
          window_type_id: newWindowType.id,
          pvcColor_id: Number(colorId),
        }));

        await tx.window_types_pvcColor.createMany({
          data: linksData,
        });
      }

      return newWindowType;
    });
  }

  findAll() {
    return this.prisma.window_types.findMany({
      orderBy: { id: 'asc' },
    });
  }

  findOne(id: number) {
    return this.prisma.window_types.findUnique({ where: { id } });
  }

  update(id: number, data: { name?: string; description?: string }) {
    // Nota: La edición de asociaciones se manejaría de forma separada por simplicidad.
    // Esta función solo actualiza el nombre y la descripción.
    return this.prisma.window_types.update({
      where: { id },
      data,
    });
  }

  async findByPvcColor(colorId: number) {
    return this.prisma.window_types.findMany({
      where: {
        pvcLinks: {
          some: { pvcColor_id: colorId },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  remove(id: number) {
    // Prisma se encargará de borrar en cascada las asociaciones si está configurado.
    // Si no, necesitamos una transacción aquí también para borrar los enlaces primero.
    return this.prisma.window_types.delete({ where: { id } });
  }
}
