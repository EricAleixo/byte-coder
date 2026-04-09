import { Test, TestingModule } from '@nestjs/testing';
import { CateoriesController } from './categories.controller';
import { CateoriesService } from './categories.service';

describe('CateoriesController', () => {
  let controller: CateoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CateoriesController],
      providers: [CateoriesService],
    }).compile();

    controller = module.get<CateoriesController>(CateoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
