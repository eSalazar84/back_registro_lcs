import { CreateViviendaDto } from '../vivienda/dto/create-vivienda.dto';
import { Controller, Get, Post, Body, Patch, Param, HttpStatus, HttpException, BadRequestException, Put, Query } from '@nestjs/common';
import { RegistroService } from './registro.service';
import { CreateLoteDto } from '../lote/dto/create-lote.dto';
import { CreateIngresoDto } from '../ingreso/dto/create-ingreso.dto';
import { CreatePersonaDto } from '../persona/dto/create-persona.dto';

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
      // Llamada al servicio para crear los registros
      const personas = await this.registroService.createAll(createAllDto);

      return {
        status: HttpStatus.CREATED,
        message: 'Registros creados exitosamente',
        data: personas,
        count: personas.length
      };
    } catch (error) {
      console.log("error controller catch", error);

      // Si el error es un Error genérico lanzado desde el servicio, lo tratamos como BadRequestException
      if (error instanceof Error) {
        console.log("Error de servicio:", error.message);

        // Convertimos el error a BadRequestException para devolver un estado 400
        throw new BadRequestException(error.message);
      }

      // Si no es un BadRequestException, se maneja como error 500
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Error del servidor',
        message: 'Error al procesar los registros'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('localidad') localidad?: string,
    @Query('titular') titular?: boolean
  ) {
    return await this.registroService.findAll({
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
      search,
      localidad,
      titular
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.registroService.findOneById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateDto: any) {
    try {
      const registroActualizado = await this.registroService.update(id, updateDto);
      return {
        status: HttpStatus.OK,
        message: 'Registro actualizado exitosamente',
        data: registroActualizado
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Error en la actualización',
          message: error.message
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }
  
  @Get('vivienda/:id')
  async findByViviendaId(@Param('id') id: number) {
    return this.registroService.findByViviendaId(id);
  }



}
