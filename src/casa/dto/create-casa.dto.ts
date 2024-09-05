import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator"
import { Residencia } from "../enum/residencia.enum"

export class CreateCasaDto {
    id: number

    @IsString()
    @IsNotEmpty()
    direccion: string

    @IsNumber()
    numero: number

    @IsBoolean()
    departamento: boolean

    @IsString()
    @IsNotEmpty()
    num_departamento: string

    @IsBoolean()
    alquiler: boolean

    @IsNumber()
    monto_alquiler: number

    @IsEnum(Residencia)
    @IsNotEmpty()
    residencia: Residencia
}
