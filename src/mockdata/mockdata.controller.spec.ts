import { Test, TestingModule } from '@nestjs/testing';
import { MockdataController } from './mockdata.controller';

describe('MockdataController', () => {
  let controller: MockdataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MockdataController],
    }).compile();

    controller = module.get<MockdataController>(MockdataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
