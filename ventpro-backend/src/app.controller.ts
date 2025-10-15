import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Solo la raíz devuelve "Hello World!"
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
