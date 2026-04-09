import { Test, TestingModule } from '@nestjs/testing';
import { CateoriesService } from './categories.service';

describe('CateoriesService', () => {
  let service: CateoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CateoriesService],
    }).compile();

    service = module.get<CateoriesService>(CateoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
