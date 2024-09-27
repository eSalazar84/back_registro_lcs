import { PartialType } from '@nestjs/mapped-types';
import { CreateCasaDto } from './create-casa.dto';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Localidad } from '../enum/localidad.enum';
import { Estado_vivienda } from '../enum/estado_vivienda.enum';
import { Alquiler } from '../enum/alquiler.enum';

export class UpdateCasaDto extends PartialType(CreateCasaDto) {

    idCasa: number

    @IsString()
    @IsNotEmpty()
    direccion?: string

    @IsNumber()
    numero_direccion?: number

    @IsBoolean()
    departamento?: boolean

    @IsString()
    @IsNotEmpty()
    numero_departamento: string

    @IsBoolean()
    alquiler: boolean

    @IsNumber()
    valor_alquiler: number

    @IsEnum(Localidad)
    @IsNotEmpty()
    Localidad: Localidad
    
    @IsNumber()
    cantidad_dormitorios: number

    @IsEnum(Estado_vivienda)
    estado_vivienda: Estado_vivienda

    @IsEnum(Alquiler)
    tipo_alquiler: Alquiler


}
