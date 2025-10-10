import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ✅ Obtener todos los pedidos
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  // ✅ Obtener un pedido específico
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  // ✅ Crear un nuevo pedido
  @Post()
  async create(@Body() body: any) {
    console.log('📦 Creando pedido con datos:', body);
    return this.ordersService.create(body);
  }

  // ✅ Actualizar un pedido existente
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.ordersService.update(id, body);
  }

  // ✅ Eliminar un pedido
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.remove(id);
  }
}
