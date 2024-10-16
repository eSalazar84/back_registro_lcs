import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Relacion } from "../enum/relacion.enum";
import { Persona } from "src/persona/entities/persona.entity";
@Entity()
export class Ingreso {
    @PrimaryGeneratedColumn()
    idIngreso: number;

    @Column({ type: 'enum', enum: Relacion })
    situacion_laboral: Relacion;

    @Column({ type: 'varchar', length: 120, nullable: true })
    ocupacion: string | null;

    @Column({ type: 'bigint', nullable: true })
    CUIT_empleador: number | null;

    @Column({ type: 'int' , nullable: true})
    salario: number | null;

    @Column({type:"int"})
    idPersona: number

    @ManyToOne(() => Persona, (persona) => persona.ingresos) // Relación inversa
    @JoinColumn({ name: "idPersona" }) // Define el nombre de la columna en la tabla
    persona: Persona; // Aquí se mantiene la referencia a la entidad Persona
}
