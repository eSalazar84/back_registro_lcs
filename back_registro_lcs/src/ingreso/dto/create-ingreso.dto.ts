import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator"
import { Relacion } from "../enum/relacion.enum"

export class CreateIngresoDto{  

    idIngreso: number

    @IsEnum(Relacion)
    @IsNotEmpty()
    situacion_laboral: Relacion

    @IsString()    
    ocupacion?: string | null

    @IsNumber()
    CUIT_empleador?: number | null

    @IsNumber()
    salario?: number | null

    @IsNumber()
    @IsNotEmpty()   
    idPersona: number
 
}
