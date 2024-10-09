import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Relacion } from "../enum/relacion.enum";
import { Persona } from "src/persona/entities/persona.entity";
@Entity()
export class Ingreso {
    @PrimaryGeneratedColumn()
    idIngreso: number;

    @Column({ type: 'enum', enum: Relacion })
    situacion_laboral: Relacion;

    @Column({ type: 'varchar', length: 120 })
    ocupacion: string;

    @Column({ type: 'bigint' })
    CUIT_empleador: number;

    @Column({ type: 'int' })
    salario: number;

    @Column({ type: 'int', nullable: true })
    idPersona: number; // Mantén esta columna

    @ManyToOne(() => Persona, persona => persona.ingresos)
    @JoinColumn({ name: 'idPersona' }) // Usa el mismo nombre
    persona: Persona; // Relación con Persona
}
