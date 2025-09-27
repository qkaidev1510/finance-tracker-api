import { Test, TestingModule } from '@nestjs/testing';
import { MockdataService } from './mockdata.service';

describe('MockdataService', () => {
  let service: MockdataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MockdataService],
    }).compile();

    service = module.get<MockdataService>(MockdataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
