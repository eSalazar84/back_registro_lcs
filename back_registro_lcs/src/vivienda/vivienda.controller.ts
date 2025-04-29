import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, ParseIntPipe, HttpCode, ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { ViviendaService } from './vivienda.service';
import { CreateViviendaDto } from './dto/create-vivienda.dto';
import { UpdateViviendaDto } from './dto/update-vivienda.dto';
import { Vivienda } from './entities/vivienda.entity';

@Controller('vivienda')
export class ViviendaController {
  constructor(private readonly viviendaService: ViviendaService) { }

  @Post()
  async create(@Body() createViviendaDto: CreateViviendaDto): Promise<Vivienda> {
    try {
      return await this.viviendaService.createVivienda(
        createViviendaDto,
        undefined,
        createViviendaDto.idRegistro // 👈 lo pasás si viene en el DTO
      );
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: `NOT VALID`
      }, HttpStatus.BAD_REQUEST);
    }
  }
  

  @Get()
  async findAll(): Promise<Vivienda[]> {
    return this.viviendaService.findAllVivienda();
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.viviendaService.findOneById(+id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK) // Establecer el código de estado 200 en caso de éxito
  async update(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number, 
    @Body() UpdateViviendaDto: UpdateViviendaDto
  ): Promise<Vivienda> {
    try {
      // Intentar actualizar la vivienda
      const vivienda = await this.viviendaService.updateVivienda(id, UpdateViviendaDto);
      return vivienda; // El método de servicio ya maneja la actualización y devuelve la vivienda actualizada
    } catch (error) {
      // Lanza las excepciones correspondientes según el tipo de error
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message); // Devuelve 409 en caso de conflicto
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message); // Devuelve 404 en caso de no encontrar la vivienda
      }
      throw new InternalServerErrorException('Error al actualizar la vivienda'); // Devuelve 500 en caso de otros errores
    }
  }


  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.viviendaService.removeVivienda(+id);
  }


}
