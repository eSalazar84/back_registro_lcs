import { PartialType } from '@nestjs/mapped-types';
import { CreatePersonaDto } from './create-persona.dto';
import { CreateViviendaDto } from 'src/vivienda/dto/create-vivienda.dto';


export class UpdatePersonaDto extends PartialType(CreatePersonaDto) {

    idPersona?: number
    vivienda?: CreateViviendaDto;
   
}
