import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GlassColorsService } from './glass-colors.service';

@Controller('glass-colors')
export class GlassColorsController {
  constructor(private readonly glassColorsService: GlassColorsService) {}

  @Post()
  create(@Body() body: { name: string; description?: string }) {
    return this.glassColorsService.create(body);
  }

  @Get()
  findAll() {
    return this.glassColorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.glassColorsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: { name?: string; description?: string }) {
    return this.glassColorsService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.glassColorsService.remove(+id);
  }
}
