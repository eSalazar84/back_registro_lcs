import { IsEnum, IsNotEmpty, IsNumber } from "class-validator"
import { Localidad } from "../enum/localidad.enum"

export class CreateLoteDto {
    idLote: number

    @IsEnum(Localidad)
    @IsNotEmpty()
    localidad: Localidad
}
