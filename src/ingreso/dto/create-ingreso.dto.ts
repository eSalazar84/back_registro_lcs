import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator"
import { Relacion } from "../enum/relacion.enum"

export class CreateIngresoDto{  

    idIngreso: number

    @IsEnum(Relacion)
    @IsNotEmpty()
    situacion_laboral: Relacion

    @IsString()    
    ocupacion: string

    @IsNumber()
    CUIT_empleador: number

    @IsNumber()
    salario: number

     // Relación con Persona: se pasa el id de la persona
     @IsNumber()
     personaId: number;
 
}
