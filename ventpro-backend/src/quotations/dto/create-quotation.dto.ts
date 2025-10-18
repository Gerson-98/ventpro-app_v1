// src/quotations/dto/create-quotation.dto.ts

import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

// Esta es la "sub-lista de ingredientes" para cada ventana dentro de la cotización
class QuotationWindowDto {
  @IsNumber()
  @IsNotEmpty()
  width_m: number; // Recibimos en metros desde el frontend

  @IsNumber()
  @IsNotEmpty()
  height_m: number; // Recibimos en metros desde el frontend

  @IsOptional()
  @IsNumber()
  price_per_m2?: number;

  @IsNumber()
  @IsNotEmpty()
  window_type_id: number;

  @IsNumber()
  @IsNotEmpty()
  color_id: number;

  @IsNumber()
  @IsNotEmpty()
  glass_color_id: number;
}

// Esta es la lista de ingredientes principal para la cotización
export class CreateQuotationDto {
  @IsString()
  @IsNotEmpty()
  project: string;

  @IsNumber()
  @IsNotEmpty()
  price_per_m2: number;

  @IsNumber()
  @IsOptional() // El cliente puede ser opcional al crear
  clientId?: number;

  @IsArray()
  @ValidateNested({ each: true }) // Le dice a NestJS que valide cada objeto de la lista
  @Type(() => QuotationWindowDto) // Le dice a NestJS qué "forma" tienen los objetos de la lista
  windows: QuotationWindowDto[];
}

export class ConfirmQuotationDto {
  @IsDateString()
  @IsNotEmpty()
  installationStartDate: string;

  @IsDateString()
  @IsNotEmpty()
  installationEndDate: string;
}
