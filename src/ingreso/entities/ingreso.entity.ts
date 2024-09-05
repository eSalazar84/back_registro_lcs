import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Relacion } from "../enum/relacion.enum";

@Entity()
export class Ingreso {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'enum', enum: Relacion })
    tipo_relacion: Relacion

    @Column({ type: 'varchar', length: 120 })
    ocupacion: string

    @Column({ type: 'int' })
    CUIT_empleador: number

    @Column({ type: 'int' })
    salario: number
}
