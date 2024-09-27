import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator"
import { Relacion } from "../enum/relacion.enum"

export class CreateIngresoDto {
    id: number

    @IsEnum(Relacion)
    @IsNotEmpty()
    tipo_relacion: Relacion

    @IsString()    
    ocupacion: string

    @IsNumber()
    CUIT_empleador: number

    @IsNumber()
    salario: number
}
