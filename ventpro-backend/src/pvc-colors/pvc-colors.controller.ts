import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PvcColorsService } from './pvc-colors.service';
import { CreatePvcColorDto } from './dto/create-pvc-color.dto';

@Controller('pvc-colors')
export class PvcColorsController {
  constructor(private readonly pvcColorsService: PvcColorsService) {}

  @Post()
  create(@Body() createPvcColorDto: CreatePvcColorDto) {
    return this.pvcColorsService.create(createPvcColorDto);
  }

  @Get()
  async findAll() {
    const result = await this.pvcColorsService.findAll();
    return Array.isArray(result) ? result : []; // ✅ garantiza siempre array
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pvcColorsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: CreatePvcColorDto) {
    return this.pvcColorsService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pvcColorsService.remove(+id);
  }
}
