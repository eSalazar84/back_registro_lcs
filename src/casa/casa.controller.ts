import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CasaService } from './casa.service';
import { CreateCasaDto } from './dto/create-casa.dto';
import { UpdateCasaDto } from './dto/update-casa.dto';

@Controller('casa')
export class CasaController {
  constructor(private readonly casaService: CasaService) { }

  @Post()
  async create(@Body() createCasaDto: CreateCasaDto) {
    return await this.casaService.create(createCasaDto);
  }

  @Get()
  findAll() {
    return this.casaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.casaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCasaDto: UpdateCasaDto) {
    return this.casaService.update(+id, updateCasaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.casaService.remove(+id);
  }
}
