import { CreateViviendaDto } from 'src/vivienda/dto/create-vivienda.dto';
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RegistroService } from './registro.service';

import { UpdateRegistroDto } from './dto/update-registro.dto';
import { CreateLoteDto } from 'src/lote/dto/create-lote.dto';
import { CreateIngresoDto } from 'src/ingreso/dto/create-ingreso.dto';
import { CreatePersonaDto } from 'src/persona/dto/create-persona.dto';
import { CreateRegistroDto } from './dto/create-registro.dto';
import { Persona } from 'src/persona/entities/persona.entity';
import { HttpException, HttpStatus, BadRequestException } from '@nestjs/common';

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
  ) {
    try {
      const personas = await this.registroService.createAll(createAllDto);
      return {
        status: HttpStatus.CREATED,
        message: 'Registros creados exitosamente',
        data: personas,
        count: personas.length
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new HttpException({
          status: HttpStatus.BAD_REQUEST,
          error: 'Error de validación',
          message: error.message
        }, HttpStatus.BAD_REQUEST);
      }

      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Error del servidor',
        message: 'Error al procesar los registros'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
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
