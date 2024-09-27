import { IsBoolean, IsDate, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsString, Length, Matches } from "class-validator"
import { Estado_Civil } from "../enum/estado_civil.enum"
import { Genero } from "../enum/genero.enum"
import { Nacionalidad } from "../enum/nacionalidad.enum"
import { Tipo_DNI } from "../enum/tipo_dni.enum"
import { Vinculo } from "../enum/vinculo.enum"

export class CreatePersonaDto {

    id: number

    @IsNumber()
    numero_registro: number

    @IsString()
    @IsNotEmpty()
    @Length(120)
    nombre: string

    @IsString()
    @IsNotEmpty()
    @Length(120)
    apellido: string

    @IsEnum(Tipo_DNI)
    tipo_dni: Tipo_DNI

    @IsNumber()
    dni: number

    @IsNumber()
    CUIL_CUIT: number

    @IsEnum(Genero)
    genero: Genero

    @IsDate()
    fecha_nacimiento: Date

    @IsEmail()
    @IsNotEmpty()
    email: string

    @IsString()
    @Matches(/^[+\d\s-]+$/, { message: 'El número de teléfono contiene caracteres no permitidos.' })
    telefono: string

    @IsEnum(Estado_Civil)
    estado_civil: Estado_Civil

    @IsEnum(Nacionalidad)
    nacionalidad: Nacionalidad

    @IsBoolean()
    certificado_discapacidad: boolean

    @IsEnum(Vinculo)
    vinculo: Vinculo

}
