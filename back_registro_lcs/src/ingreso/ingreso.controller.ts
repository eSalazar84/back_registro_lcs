import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpException, UsePipes, ValidationPipe } from '@nestjs/common';
import { IngresoService } from './ingreso.service';
import { CreateIngresoDto } from './dto/create-ingreso.dto';
import { UpdateIngresoDto } from './dto/update-ingreso.dto';
import { Ingreso } from './entities/ingreso.entity';

@Controller('ingreso')
export class IngresoController {
  constructor(private readonly ingresoService: IngresoService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true })) 
  async createIngreso(@Body() ingresos: CreateIngresoDto[], idPersona: number):Promise<Ingreso[]> {
    try{
      return await this.ingresoService.createIngreso(ingresos, idPersona);
    }catch(error){
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: `NOT VALID`
      }, HttpStatus.BAD_REQUEST)
    }
  }



  @Get()
  findAll() {
    return this.ingresoService.findAllIngreso();
  }

  @Get(':id')
  findOneById(@Param('id') id: string) {
    return this.ingresoService.findOneById(+id);
  }

  @Patch(':id')
  updateIngreso(@Param('id') id: string, @Body() updateIngresoDto: UpdateIngresoDto):Promise<Ingreso> {
    return this.ingresoService.updateIngreso(+id, updateIngresoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ingresoService.removeIngreso(+id);
  }
}
