import { IsEnum, IsNotEmpty, IsNumber } from "class-validator"
import { Localidad } from "../enum/localidad.enum"

export class CreateLoteDto {
    

    @IsEnum(Localidad)
    @IsNotEmpty()
    localidad: Localidad
}
