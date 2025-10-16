import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // ✨ Creamos nuestra ruta personalizada ✨
  // Cuando el frontend pida GET /reports/order/1/profiles, esta función se ejecutará.
  @Get('order/:orderId/profiles')
  generateProfilesReport(
    @Param('orderId', ParseIntPipe) orderId: number, // NestJS se asegura de que el ID sea un número válido
  ) {
    return this.reportsService.generateProfilesReport(orderId);
  }
  // ✨ AÑADE ESTE NUEVO ENDPOINT PARA EL OPTIMIZADOR ✨
  @Get('order/:orderId/optimize-cuts')
  generateCutOptimizationReport(
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    // Llamará a una nueva función en nuestro servicio
    return this.reportsService.generateCutOptimizationReport(orderId);
  }
}
