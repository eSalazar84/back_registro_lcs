import { Injectable } from '@nestjs/common';
import { CreateCasaDto } from './dto/create-casa.dto';
import { UpdateCasaDto } from './dto/update-casa.dto';

@Injectable()
export class CasaService {
  create(createCasaDto: CreateCasaDto) {
    return 'This action adds a new casa';
  }

  findAll() {
    return `This action returns all casa`;
  }

  findOne(id: number) {
    return `This action returns a #${id} casa`;
  }

  update(id: number, updateCasaDto: UpdateCasaDto) {
    return `This action updates a #${id} casa`;
  }

  remove(id: number) {
    return `This action removes a #${id} casa`;
  }
}
