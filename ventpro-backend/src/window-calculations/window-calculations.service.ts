// ventpro-backend/src/window-calculations/window-calculations.service.ts
// (Crea una nueva carpeta y este archivo dentro)

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WindowCalculationsService {
  constructor(private prisma: PrismaService) {}

  // Devuelve todos los tipos de ventana, incluyendo su cálculo si existe
  async findAllTypesWithCalculations() {
    return this.prisma.window_types.findMany({
      include: {
        calculation: true, // Incluye la data de la tabla window_calculations
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  // Crea o actualiza una regla de cálculo. ¡`upsert` es perfecto para esto!
  async upsert(data: any) {
    const { window_type_id, ...calcData } = data;

    return this.prisma.window_calculations.upsert({
      where: {
        window_type_id: Number(window_type_id),
      },
      update: {
        ...calcData,
      },
      create: {
        window_type_id: Number(window_type_id),
        ...calcData,
      },
    });
  }
}
