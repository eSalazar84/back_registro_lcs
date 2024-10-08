import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator"
import { Relacion } from "../enum/relacion.enum"

export class CreateIngresoDto {
  map(arg0: (ingreso: any) => Promise<import("../entities/ingreso.entity").Ingreso[]>): any {
    throw new Error('Method not implemented.')
  }
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

    @IsNumber()
    @IsNotEmpty()   
    idPersona: number
 
}
