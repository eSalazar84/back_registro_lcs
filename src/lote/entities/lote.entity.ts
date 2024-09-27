import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Localidad } from "../enum/localidad.enum";

@Entity()
export class Lote {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'enum', enum: Localidad })
    localidad: Localidad
}
