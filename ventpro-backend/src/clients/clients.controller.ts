import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ClientsService } from './clients.service';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  findAll() {
    return this.clientsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(Number(id));
  }

  @Post()
  create(@Body() data: { name: string; phone?: string; email?: string; address?: string }) {
    return this.clientsService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: { name?: string; phone?: string; email?: string; address?: string }) {
    return this.clientsService.update(Number(id), data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientsService.remove(Number(id));
  }
}
