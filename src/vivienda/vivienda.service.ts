import { HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateViviendaDto } from './dto/create-vivienda.dto';
import { UpdateViviendaDto } from './dto/update-vivienda.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Vivienda } from './entities/vivienda.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { Localidad } from './enum/localidad.enum';


@Injectable()
export class ViviendaService {
  constructor(
    @InjectRepository(Vivienda)
    private readonly viviendaRepository: Repository<Vivienda>,

  ) { }

  async createVivienda(createViviendaDto: CreateViviendaDto): Promise<Vivienda> {
    const nuevaVivienda = new Vivienda();

    // Asignar propiedades del DTO a la entidad
    nuevaVivienda.direccion = createViviendaDto.direccion;
    nuevaVivienda.numero_direccion = createViviendaDto.numero_direccion;
    nuevaVivienda.departamento = createViviendaDto.departamento;
    nuevaVivienda.piso_departamento = createViviendaDto.piso_departamento || null; // valor opcional
    nuevaVivienda.numero_departamento = createViviendaDto.numero_departamento || null; // valor opcional
    nuevaVivienda.alquiler = createViviendaDto.alquiler;
    nuevaVivienda.valor_alquiler = createViviendaDto.valor_alquiler || null; // valor opcional
    nuevaVivienda.localidad = createViviendaDto.localidad;
    nuevaVivienda.cantidad_dormitorios = createViviendaDto.cantidad_dormitorios;
    nuevaVivienda.estado_vivienda = createViviendaDto.estado_vivienda;
    nuevaVivienda.tipo_alquiler = createViviendaDto.tipo_alquiler;

    // Guardar la vivienda en la base de datos
    const vivienda = await this.viviendaRepository.save(nuevaVivienda);
    return vivienda;
  }

  async findAllVivienda(): Promise<Vivienda[]> {
    const allVivienda = await this.viviendaRepository.find()
    return allVivienda;
  }

  async findOne(id: number): Promise<Vivienda> {
    const query: FindOneOptions<Vivienda> = { where: { idVivienda: id }, relations: ['persona'] };

    const vivienda = await this.viviendaRepository.findOne(query);
    if (!vivienda) {
      throw new HttpException('Cicienda no encontrado', HttpStatus.NOT_FOUND);
    }
    return vivienda;
  }

  async updateVivienda(id: number, updateViviendaDto: UpdateViviendaDto): Promise<Vivienda> {
    try {
      const queryFound: FindOneOptions = { where: { idVivienda: id } };
      const viviendaFound = await this.viviendaRepository.findOne(queryFound);

      if (!viviendaFound) {
        throw new NotFoundException(`Vivienda con id ${id} no encontrada`);
      }

      // Actualiza los campos de viviendaFound con los valores de updateViviendaDto
      Object.assign(viviendaFound, updateViviendaDto);

      // Guarda los cambios en la base de datos
      await this.viviendaRepository.save(viviendaFound);

      return viviendaFound;
    } catch (error) {
      throw new InternalServerErrorException('Error al actualizar la vivienda');
    }
  }

  async findByAddress(direccion: string, numero_direccion: number, localidad: Localidad, departamento: boolean |  null, piso_departamento:number, numero_departamento:string): Promise<Vivienda | null> {
    return await this.viviendaRepository.findOne({
        where: { direccion, numero_direccion, localidad, departamento, piso_departamento, numero_departamento }
    });
}

}
