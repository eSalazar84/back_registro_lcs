import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Relacion } from "../enum/relacion.enum";

@Entity()
export class Ingreso {
    @PrimaryGeneratedColumn()
    idIngreso: number

    @Column({ type: 'enum', enum: Relacion })
    situacion_laboral: Relacion

    @Column({ type: 'varchar', length: 120 })
    ocupacion: string

    @Column({ type: 'bigint' })
    CUIT_empleador: number

    @Column({ type: 'int' })
    salario: number
}
