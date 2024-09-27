import { Test, TestingModule } from '@nestjs/testing';
import { CasaService } from './casa.service';

describe('CasaService', () => {
  let service: CasaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CasaService],
    }).compile();

    service = module.get<CasaService>(CasaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
