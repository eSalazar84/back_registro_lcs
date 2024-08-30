import { IsNumber, IsString } from "class-validator"
import { Estado_Civil } from "../enum/estado_civil.enum"
import { Genero } from "../enum/genero.enum"
import { Nacionalidad } from "../enum/nacionalidad.enum"
import { Tipo_DNI } from "../enum/tipo_dni.enum"
import { Vinculo } from "../enum/vinculo.enum"

export class CreatePersonaDto {

    
    numero_registro: number

    @IsString()
    
    nombre: string

    apellido: string

    tipo_dni: Tipo_DNI

    dni: number

    CUIL_CUIT: number

    genero: Genero

    fecha_nacimiento: Date

    email: string

    telefono: string

    estado_civil: Estado_Civil

    nacionalidad: Nacionalidad

    certificado_discapacidad: boolean

    vinculo: Vinculo

    lote: number
}
