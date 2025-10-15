// ventpro-backend/src/window-calculations/window-calculations.controller.ts

import { Controller, Get, Post, Body } from '@nestjs/common';
import { WindowCalculationsService } from './window-calculations.service';

@Controller('window-calculations')
export class WindowCalculationsController {
  constructor(
    private readonly calculationsService: WindowCalculationsService,
  ) {}

  @Get()
  findAll() {
    return this.calculationsService.findAllTypesWithCalculations();
  }

  @Post()
  upsert(@Body() data: any) {
    return this.calculationsService.upsert(data);
  }
}
