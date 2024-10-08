import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { PersonaService } from './persona.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';

@Controller('persona')
export class PersonaController {
  constructor(private readonly personaService: PersonaService) {}

  @Post()
  async createPersona(@Body() createPersonaDto: CreatePersonaDto): Promise<CreatePersonaDto> {
    try{
      return await this.personaService.createPersona(createPersonaDto);

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
//   @Post()
// async createPersona(@Body() createPersonaDto: CreatePersonaDto): Promise<CreatePersonaDto> {
//     try {
//         return await this.personaService.create(createPersonaDto);
//     } catch (error) {
//         // Log del error para depuración
//         console.error('Error al crear la persona:', error);

//         // Manejo de errores más detallado
//         if (error.code === 'ER_DUP_ENTRY') {
//             throw new HttpException({
//                 status: HttpStatus.CONFLICT,
//                 error: 'Ya existe una persona con ese DNI o CUIL.',
//             }, HttpStatus.CONFLICT);
//         } else {
//             throw new HttpException({
//                 status: HttpStatus.BAD_REQUEST,
//                 error: 'Error al crear la persona. ' + (error.message || 'Detalles no disponibles.'),
//             }, HttpStatus.BAD_REQUEST);
//         }
//     }
// }


  @Get()
  findAll() {
    return this.personaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personaService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number, @Body() UpdatePersonaDto: UpdatePersonaDto): Promise<UpdatePersonaDto> {
    return this.personaService.updatePersona(+id, UpdatePersonaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.personaService.remove(+id);
  }
}
