import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FraudDetectionModule } from './fraud-detection/fraud-detection.module';

@Module({
  imports: [FraudDetectionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
