import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders') // ✅ MUY IMPORTANTE
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(Number(id));
  }

  @Post()
  create(@Body() data: CreateOrderDto) {
    return this.ordersService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateOrderDto) {
    return this.ordersService.update(Number(id), data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(Number(id));
  }
}
