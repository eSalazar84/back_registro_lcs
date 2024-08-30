import { Test, TestingModule } from '@nestjs/testing';
import { CasaController } from './casa.controller';
import { CasaService } from './casa.service';

describe('CasaController', () => {
  let controller: CasaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CasaController],
      providers: [CasaService],
    }).compile();

    controller = module.get<CasaController>(CasaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
