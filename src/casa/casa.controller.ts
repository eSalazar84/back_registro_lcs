import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { CasaService } from './casa.service';
import { CreateCasaDto } from './dto/create-casa.dto';
import { UpdateCasaDto } from './dto/update-casa.dto';

@Controller('casa')
export class CasaController {
  constructor(private readonly casaService: CasaService) { }

  @Post()
  async create(@Body() createCasaDto: CreateCasaDto): Promise<CreateCasaDto> {
    try {
      return await this.casaService.createCasa(createCasaDto);
    }
    catch (error) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: `NOT VALID`
      }, HttpStatus.BAD_REQUEST)
    }
  }

  @Get()
  async findAll(): Promise<CreateCasaDto[]> {
    return this.casaService.findAllCasa();
  }

  @Patch(':id')
  async update(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number, @Body() UpdateCasaDto: UpdateCasaDto): Promise<UpdateCasaDto> {
    return this.casaService.updateCasa(+id, UpdateCasaDto);
  }

}
