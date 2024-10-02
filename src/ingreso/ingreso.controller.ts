import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpException, UsePipes, ValidationPipe } from '@nestjs/common';
import { IngresoService } from './ingreso.service';
import { CreateIngresoDto } from './dto/create-ingreso.dto';
import { UpdateIngresoDto } from './dto/update-ingreso.dto';

@Controller('ingreso')
export class IngresoController {
  constructor(private readonly ingresoService: IngresoService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true })) 
  async createIngreso(@Body() createIngresoDto: CreateIngresoDto):Promise<CreateIngresoDto> {
    try{
      return await this.ingresoService.createIngreso(createIngresoDto);
    }catch(error){
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: `NOT VALID`
      }, HttpStatus.BAD_REQUEST)
    }
  }



  @Get()
  findAll() {
    return this.ingresoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ingresoService.findOne(+id);
  }

  @Patch(':id')
  updateIngreso(@Param('id') id: string, @Body() updateIngresoDto: UpdateIngresoDto):Promise<UpdateIngresoDto> {
    return this.ingresoService.updateIngreso(+id, updateIngresoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ingresoService.remove(+id);
  }
}
