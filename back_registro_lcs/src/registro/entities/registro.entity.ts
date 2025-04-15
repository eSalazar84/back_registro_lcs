import {
    Entity,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
    OneToMany
  } from 'typeorm';
  import { Vivienda } from 'src/vivienda/entities/vivienda.entity';
  import { Lote } from 'src/lote/entities/lote.entity';
  import { Ingreso } from 'src/ingreso/entities/ingreso.entity';
  import { Persona } from 'src/persona/entities/persona.entity';
  
  @Entity()
  export class Registro {
    @PrimaryGeneratedColumn()
    idRegistro: number;
  
    @OneToOne(() => Vivienda, { cascade: true })
    @JoinColumn()
    vivienda: Vivienda;
  
    @OneToOne(() => Lote, { cascade: true })
    @JoinColumn()
    lote: Lote;
  
    @OneToMany(() => Ingreso, ingreso => ingreso.registro, { cascade: true })
    ingresos: Ingreso[];
  
  

    @OneToMany(() => Persona, persona => persona.registro, { cascade: true })
personas: Persona[];

  }
  