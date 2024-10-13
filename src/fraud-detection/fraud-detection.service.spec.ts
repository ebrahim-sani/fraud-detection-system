import { Test, TestingModule } from '@nestjs/testing';
import { FraudDetectionService } from './fraud-detection.service';

describe('FraudDetectionService', () => {
  let service: FraudDetectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FraudDetectionService],
    }).compile();

    service = module.get<FraudDetectionService>(FraudDetectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
