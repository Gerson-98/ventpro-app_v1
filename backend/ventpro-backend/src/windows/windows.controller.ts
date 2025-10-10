import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { WindowsService } from './windows.service';

@Controller('windows')
export class WindowsController {
  constructor(private readonly windowsService: WindowsService) {}

  @Get()
  findAll() {
    return this.windowsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.windowsService.findOne(Number(id));
  }

  @Post()
  async create(@Body() data: any) {
    console.log('🧾 Datos recibidos del frontend:', data);
    return this.windowsService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.windowsService.update(Number(id), data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.windowsService.remove(Number(id));
  }
}
