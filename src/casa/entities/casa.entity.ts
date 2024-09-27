import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Localidad } from "../enum/localidad.enum";
import { Alquiler } from "../enum/alquiler.enum";
import { Estado_vivienda } from "../enum/estado_vivienda.enum";

@Entity()
export class Casa {
    @PrimaryGeneratedColumn()
    idCasa: number

    @Column({ type: 'varchar' })
    direccion: string

    @Column({ type: 'int' })
    numero_direccion: number

    @Column({ type: 'boolean' })
    departamento: boolean

    @Column({ type: 'varchar' })
    numero_departamento: string

    @Column({ type: 'boolean' })
    alquiler: boolean

    @Column({ type: 'int' })
    valor_alquiler: number

    @Column({ type: 'enum', enum: Localidad })
    Localidad: Localidad

    @Column({ type: 'int' })
    cantidad_dormitorios: number

    @Column({ type: 'enum', enum: Estado_vivienda })
    estado_vivienda: Estado_vivienda

    @Column({ type: 'enum', enum: Alquiler })
    tipo_alquiler: Alquiler
}
