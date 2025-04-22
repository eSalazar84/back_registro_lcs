import { PartialType } from '@nestjs/mapped-types';
import { CreateViviendaDto } from './create-vivienda.dto';

export class UpdateViviendaDto extends PartialType(CreateViviendaDto) {
  idVivienda: number;
}
