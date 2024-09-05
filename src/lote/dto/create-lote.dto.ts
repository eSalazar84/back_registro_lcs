import { IsEnum, IsNotEmpty } from "class-validator"
import { Localidad } from "../enum/localidad.enum"

export class CreateLoteDto {
    id: number

    @IsEnum(Localidad)
    @IsNotEmpty()
    localidad: Localidad
}
