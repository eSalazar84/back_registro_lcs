import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Residencia } from "../enum/residencia.enum";
import { Alquiler } from "../enum/alquiler.enum";

@Entity()
export class Casa {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'varchar' })
    direccion: string

    @Column({ type: 'int' })
    numero_direccion: number

    @Column({ type: 'boolean' })
    departamento: boolean

    @Column({ type: 'varchar' })
    num_departamento: string

    @Column({ type: 'boolean' })
    alquiler: boolean

    @Column({ type: 'int' })
    monto_alquiler: number

    @Column({ type: 'enum', enum: Residencia })
    residencia: Residencia

    @Column({ type: 'int' })
    cantidad_dormitorios: number

    @Column({ type: 'varchar' })
    estado_vivienda: string

    @Column({type: 'enum', enum: Alquiler})
    tipo_alquiler: Alquiler
}
