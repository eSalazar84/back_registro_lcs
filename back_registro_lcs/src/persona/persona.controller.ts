import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { PersonaService } from './persona.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { Persona } from './entities/persona.entity';

@Controller('persona')
export class PersonaController {
  constructor(private readonly personaService: PersonaService) {}

  @Post()
  async createPersona(@Body() createPersonaDto: CreatePersonaDto,idVivienda: number,idLote: number): Promise<Persona> {
    try{
      return await this.personaService.createPersona(createPersonaDto,  idVivienda,idLote);
    }
    catch (error){
      if (error instanceof HttpException) {
        throw error;  // Lanza el error tal cual si ya es una HttpException
      }
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: `Ocurrio un error al crear la nueva dependencia`
      }, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }


  @Get()
  findAll() {
    return this.personaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personaService.findOneById(+id);
  }

  @Get('dni/:dni')
    FindOne(@Param('dni') dni: number){
      return this.personaService.findOneByDni(dni)
    }
  

  @Patch('dni/:dni')
  async update(@Param('dni', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) dni: number, @Body() UpdatePersonaDto: UpdatePersonaDto): Promise<UpdatePersonaDto> {
    return this.personaService.updatePersona(+dni, UpdatePersonaDto);
  }

  @Delete('dni/:dni')
  remove(@Param('dni') dni: string) {
    return this.personaService.remove(+dni);
  }

  
}
