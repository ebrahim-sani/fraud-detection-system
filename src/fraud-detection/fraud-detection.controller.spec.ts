import { Test, TestingModule } from '@nestjs/testing';
import { FraudDetectionController } from './fraud-detection.controller';

describe('FraudDetectionController', () => {
  let controller: FraudDetectionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FraudDetectionController],
    }).compile();

    controller = module.get<FraudDetectionController>(FraudDetectionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
