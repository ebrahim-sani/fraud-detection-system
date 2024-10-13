import { Module } from '@nestjs/common';
import { FraudDetectionService } from './fraud-detection.service';
import { FraudDetectionController } from './fraud-detection.controller';

@Module({
  providers: [FraudDetectionService],
  controllers: [FraudDetectionController]
})
export class FraudDetectionModule {}
