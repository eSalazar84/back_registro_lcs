import { CreateViviendaDto } from 'src/vivienda/dto/create-vivienda.dto';
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RegistroService } from './registro.service';

import { UpdateRegistroDto } from './dto/update-registro.dto';
import { CreateLoteDto } from 'src/lote/dto/create-lote.dto';
import { CreateIngresoDto } from 'src/ingreso/dto/create-ingreso.dto';
import { CreatePersonaDto } from 'src/persona/dto/create-persona.dto';
import { CreateRegistroDto } from './dto/create-registro.dto';
import { Persona } from 'src/persona/entities/persona.entity';

@Controller('registro')
export class RegistroController {
  constructor(private readonly registroService: RegistroService) { }
  @Post()
  async createAll(
    @Body() createAllDto: {
      persona: CreatePersonaDto;
      vivienda: CreateViviendaDto;
      ingresos: CreateIngresoDto[];
      lote: CreateLoteDto;
    }[]
  ): Promise<Persona[]> {
    return this.registroService.createAll(createAllDto);
  }
  // @Get()
  // findAll() {
  //   return this.registroService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.registroService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateRegistroDto: UpdateRegistroDto) {
  //   return this.registroService.update(+id, updateRegistroDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.registroService.remove(+id);
  // }
}
