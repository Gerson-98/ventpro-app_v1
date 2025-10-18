// src/quotations/quotations.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  CreateQuotationDto,
  ConfirmQuotationDto,
} from './dto/create-quotation.dto';
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

    // ✨ LÓGICA DE PRECIO ACTUALIZADA ✨
    const windowsData = windows.map((win) => {
      const widthInM = win.width_m;
      const heightInM = win.height_m;

      // Determina qué precio usar: el individual si existe, si no, el global.
      const priceToUse = win.price_per_m2 || price_per_m2;

      const windowPrice = widthInM * heightInM * priceToUse;
      totalQuotationPrice += windowPrice;

      return {
        width_cm: widthInM * 100,
        height_cm: heightInM * 100,
        price: windowPrice,
        price_per_m2: win.price_per_m2 || null, // Guarda el precio individual si existe
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
      const existingQuotation = await prisma.quotation.findUnique({
        where: { id },
      });
      if (!existingQuotation) {
        throw new NotFoundException(`Cotización con ID #${id} no encontrada.`);
      }

      // El precio global a usar para los cálculos
      const globalPriceForCalc =
        quotationData.price_per_m2 ?? existingQuotation.price_per_m2;

      let totalQuotationPrice = 0;

      // ✨ LÓGICA DE PRECIO ACTUALIZADA EN UPDATE ✨
      const windowsData = windows?.map((win) => {
        const widthInM = win.width_m;
        const heightInM = win.height_m;

        // Determina qué precio usar
        const priceToUse = win.price_per_m2 || globalPriceForCalc;

        const windowPrice = widthInM * heightInM * priceToUse;
        totalQuotationPrice += windowPrice;

        return {
          width_cm: widthInM * 100,
          height_cm: heightInM * 100,
          price: windowPrice,
          price_per_m2: win.price_per_m2 || null,
          window_type_id: win.window_type_id,
          color_id: win.color_id,
          glass_color_id: win.glass_color_id,
        };
      });

      await prisma.quotationWindow.deleteMany({ where: { quotation_id: id } });

      const updatedQuotation = await prisma.quotation.update({
        where: { id },
        data: {
          ...quotationData,
          total_price: totalQuotationPrice,
          quotation_windows: { create: windowsData },
        },
        include: { quotation_windows: true },
      });

      return updatedQuotation;
    });
  }
  // 👇 AÑADE ESTA NUEVA FUNCIÓN COMPLETA 👇
  async confirm(id: number, confirmQuotationDto: ConfirmQuotationDto) {
    // Extraemos las fechas del DTO
    const { installationStartDate, installationEndDate } = confirmQuotationDto;

    // Validación clave: si no vienen las fechas, lanzamos un error.
    if (!installationStartDate || !installationEndDate) {
      throw new BadRequestException(
        'Se requieren las fechas de inicio y fin de instalación para confirmar.',
      );
    }

    return this.prisma.$transaction(async (prisma) => {
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

      const windowsToCreate = await Promise.all(
        quotation.quotation_windows.map(async (win) => {
          const { hojaAncho, hojaAlto, vidrioAncho, vidrioAlto } =
            await this.windowsService.calculateWindowMeasurements(
              win.window_type_id,
              win.width_cm,
              win.height_cm,
            );
          return {
            width_cm: win.width_cm,
            height_cm: win.height_cm,
            price: win.price,
            window_type_id: win.window_type_id,
            color_id: win.color_id,
            glass_color_id: win.glass_color_id,
            hojaAncho,
            hojaAlto,
            vidrioAncho,
            vidrioAlto,
          };
        }),
      );

      const newOrder = await prisma.orders.create({
        data: {
          project: quotation.project,
          total: quotation.total_price,
          status: 'en proceso',
          clientId: quotation.clientId,
          // 👇 Guardamos las fechas en el nuevo pedido 👇
          installationStartDate: new Date(installationStartDate),
          installationEndDate: new Date(installationEndDate),
          windows: {
            create: windowsToCreate,
          },
        },
      });

      await prisma.quotation.update({
        where: { id: quotation.id },
        data: {
          status: 'confirmado',
          generatedOrder: { connect: { id: newOrder.id } },
        }, // Mejoramos la relación
      });

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
