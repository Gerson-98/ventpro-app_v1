// src/quotations/quotations.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { PrismaService } from '../prisma/prisma.service';
import { WindowsService } from '../windows/windows.service';

@Injectable()
export class QuotationsService {
  constructor(
    private prisma: PrismaService,
    private windowsService: WindowsService,
  ) {}

  // Tu función CREATE está perfecta, no necesita cambios.
  async create(createQuotationDto: CreateQuotationDto) {
    const { project, price_per_m2, clientId, windows } = createQuotationDto;
    let totalQuotationPrice = 0;

    const windowsData = windows.map((win) => {
      const width_cm = win.width_m * 100;
      const height_cm = win.height_m * 100;
      const windowPrice = win.width_m * win.height_m * price_per_m2;
      totalQuotationPrice += windowPrice;
      return {
        width_cm,
        height_cm,
        price: windowPrice,
        window_type_id: win.window_type_id,
        color_id: win.color_id,
        glass_color_id: win.glass_color_id,
      };
    });

    return this.prisma.quotation.create({
      data: {
        project,
        price_per_m2,
        clientId,
        total_price: totalQuotationPrice,
        quotation_windows: { create: windowsData },
      },
      include: { quotation_windows: true },
    });
  }

  // Tu función FINDALL está perfecta, no necesita cambios.
  async findAll() {
    return this.prisma.quotation.findMany({
      include: { client: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Tu función FINDONE está perfecta, no necesita cambios.
  async findOne(id: number) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id },
      include: {
        client: true,
        quotation_windows: {
          include: { window_type: true, pvcColor: true, glassColor: true },
        },
      },
    });
    if (!quotation) {
      throw new NotFoundException(`Cotización con ID #${id} no encontrada.`);
    }
    return quotation;
  }

  // ✨ AQUÍ ESTÁ LA VERSIÓN MEJORADA DE UPDATE ✨
  async update(id: number, updateQuotationDto: UpdateQuotationDto) {
    const { windows, ...quotationData } = updateQuotationDto;

    return this.prisma.$transaction(async (prisma) => {
      // 1. Primero, obtenemos la cotización actual para tener sus datos.
      const existingQuotation = await prisma.quotation.findUnique({
        where: { id },
      });
      if (!existingQuotation) {
        throw new NotFoundException(`Cotización con ID #${id} no encontrada.`);
      }

      // 2. Determinamos el precio a usar: el nuevo si se envió, si no, el que ya existía.
      const priceForCalc =
        quotationData.price_per_m2 ?? existingQuotation.price_per_m2;

      let totalQuotationPrice = 0;
      const windowsData = windows?.map((win) => {
        const windowPrice = win.width_m * win.height_m * priceForCalc;
        totalQuotationPrice += windowPrice;
        return {
          width_cm: win.width_m * 100,
          height_cm: win.height_m * 100,
          price: windowPrice,
          window_type_id: win.window_type_id,
          color_id: win.color_id,
          glass_color_id: win.glass_color_id,
        };
      });

      // 3. Borramos las ventanas viejas
      await prisma.quotationWindow.deleteMany({
        where: { quotation_id: id },
      });

      // 4. Actualizamos la cotización con los nuevos datos y las nuevas ventanas
      const updatedQuotation = await prisma.quotation.update({
        where: { id },
        data: {
          ...quotationData,
          total_price: totalQuotationPrice,
          quotation_windows: {
            create: windowsData,
          },
        },
        include: { quotation_windows: true },
      });

      return updatedQuotation;
    });
  }
  // 👇 AÑADE ESTA NUEVA FUNCIÓN COMPLETA 👇
  async confirm(id: number) {
    return this.prisma.$transaction(async (prisma) => {
      // 1. Buscamos la cotización original (esto está perfecto)
      const quotation = await prisma.quotation.findUnique({
        where: { id },
        include: {
          quotation_windows: true,
        },
      });

      if (!quotation) {
        throw new NotFoundException(`Cotización con ID #${id} no encontrada.`);
      }
      if (quotation.status === 'confirmado') {
        throw new Error(`La cotización #${id} ya ha sido confirmada.`);
      }

      // 2. Preparamos los datos de las ventanas CON CÁLCULOS
      // Como 'calculateWindowMeasurements' es asíncrona, usamos Promise.all
      const windowsToCreate = await Promise.all(
        quotation.quotation_windows.map(async (win) => {
          // Para CADA ventana, ejecutamos el cálculo
          const { hojaAncho, hojaAlto, vidrioAncho, vidrioAlto } =
            await this.windowsService.calculateWindowMeasurements(
              win.window_type_id,
              win.width_cm,
              win.height_cm,
            );

          // Devolvemos el objeto completo con los campos calculados
          return {
            width_cm: win.width_cm,
            height_cm: win.height_cm,
            price: win.price,
            window_type_id: win.window_type_id,
            color_id: win.color_id,
            glass_color_id: win.glass_color_id,
            // 👇 ¡Aquí está la magia! Añadimos los campos calculados 👇
            hojaAncho,
            hojaAlto,
            vidrioAncho,
            vidrioAlto,
          };
        }),
      );

      // 3. Creamos el nuevo Pedido con los datos completos
      const newOrder = await prisma.orders.create({
        data: {
          project: quotation.project,
          total: quotation.total_price,
          status: 'en proceso',
          clientId: quotation.clientId,
          windows: {
            create: windowsToCreate, // 👈 Usamos los datos ya calculados
          },
        },
      });

      // 4. Actualizamos el estado de la cotización (esto está perfecto)
      await prisma.quotation.update({
        where: { id: quotation.id },
        data: { status: 'confirmado' },
      });

      // 5. Devolvemos el pedido recién creado
      return newOrder;
    });
  }
  // Tu función REMOVE está perfecta, no necesita cambios.
  async remove(id: number) {
    return this.prisma.quotation.delete({
      where: { id },
    });
  }
}
