import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Tipo_DNI } from "../enum/tipo_dni.enum";
import { Genero } from "../enum/genero.enum";
import { Estado_Civil } from "../enum/estado_civil.enum";
import { Nacionalidad } from "../enum/nacionalidad.enum";
import { Vinculo } from "../enum/vinculo.enum";
import { Rol } from "../enum/rol.enum";
import { Titular_Cotitular } from "../enum/titular_cotitular.enum";
import { Vivienda } from "src/casa/entities/vivienda.entity";
import { Ingreso } from "src/ingreso/entities/ingreso.entity";
import { Lote } from "src/lote/entities/lote.entity";

@Entity()
export class Persona {
  @PrimaryGeneratedColumn()
  idPersona: number

  @Column({ type: 'int', nullable: true })
  numero_registro: number | null

  @Column({ type: 'varchar', length: 120 })
  nombre: string

  @Column({ type: 'varchar', length: 120 })
  apellido: string

  @Column({ type: 'enum', enum: Tipo_DNI })
  tipo_dni: Tipo_DNI

  @Column({ type: 'int' })
  dni: number

  @Column({ type: 'bigint' })
  CUIL_CUIT: number

  @Column({ type: 'enum', enum: Genero })
  genero: Genero

  @Column({ type: 'datetime', nullable: true })
  fecha_nacimiento: Date | null

  @Column({ type: 'varchar' })
  email: string

  @Column({ type: 'varchar' })
  telefono: string

  @Column({ type: 'enum', enum: Estado_Civil })
  estado_civil: Estado_Civil

  @Column({ type: 'enum', enum: Nacionalidad })
  nacionalidad: Nacionalidad

  @Column({ type: 'boolean' })
  certificado_discapacidad: boolean

  @Column({ type: 'enum', enum: Rol })
  rol: Rol

  @Column({ type: 'enum', enum: Vinculo, nullable: true })
  vinculo: Vinculo | null

  @Column({ type: 'enum', enum: Titular_Cotitular })
  titular_cotitular: Titular_Cotitular

  @Column({type: 'int'})
  loteId: number;

  @OneToOne(() => Lote, (lote) => lote.persona, { cascade: true })
  @JoinColumn({ name: "loteId" }) // Relación uno a uno
  lote: Lote;

  @Column({type:'int'})
  viviendaId: number

  @ManyToOne(() => Vivienda, (vivienda) => vivienda.personas, { cascade: true })
  @JoinColumn({ name: "viviendaId" }) // Relación muchos a uno
  vivienda: Vivienda;

  @OneToMany(() => Ingreso, (ingreso) => ingreso.persona, { cascade: true })
  ingresos: Ingreso[];
}
