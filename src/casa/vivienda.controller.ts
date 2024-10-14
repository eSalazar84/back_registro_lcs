import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, ParseIntPipe } from '@nestjs/common';
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
      return await this.viviendaService.createVivienda(createViviendaDto);
    }
    catch (error) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: `NOT VALID`
      }, HttpStatus.BAD_REQUEST)
    }
  }

  @Get()
  async findAll(): Promise<Vivienda[]> {
    return this.viviendaService.findAllVivienda();
  }

  @Patch(':id')
  async update(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number, @Body() UpdateViviendaDto: UpdateViviendaDto): Promise<Vivienda> {
    return this.viviendaService.updateVivienda(+id, UpdateViviendaDto);
  }

}
