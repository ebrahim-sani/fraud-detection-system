import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FraudDetectionService } from './fraud-detection.service';

// Define a type for transaction input
interface Transaction {
  amount: number; // Transaction amount
  userId: string; // User ID
  transactionType: string; // Transaction type (e.g., Purchase, Withdrawal, etc.)
  time: string; // Transaction date & time in ISO format
  location: string; // Transaction location (e.g., city name)
  currentDevice: string; // Current device type (e.g., 'mobile', 'desktop')
  currentDeviceId: string; // Current device ID
  lastDevice: string; // Last device used (e.g., 'mobile', 'desktop')
  lastDeviceId: string; // Last device ID used
  lastTransactionLocation: string; // Last transaction location
  lastTransactionAmount: number; // Last transaction amount
  userAge: number; // User age
  accountBalance: number; // Account balance before transaction
  transactionsInLast24h: number; // Transactions in the last 24 hours
  timeSinceLastTransaction: number; // Time since the last transaction in seconds
  transactionAmountDifference: number; // Difference in transaction amount
}

@Controller('api/v1')
export class FraudDetectionController {
  constructor(private readonly fraudDetectionService: FraudDetectionService) {}

  @Post('fraud-detection')
  async processTransaction(@Body() transaction: Transaction) {
    try {
      // Feature extraction from transaction data
      const features = this.extractFeatures(transaction);

      const prediction = await this.fraudDetectionService.predict(features);

      if (prediction > 0.5) {
        // Fraud detected
        throw new HttpException(
          'Transaction blocked due to suspected fraud.',
          HttpStatus.FORBIDDEN,
        );
      } else {
        // No fraud, proceed with transaction
        return { message: 'Transaction approved.' };
      }
    } catch (error) {
      throw new HttpException(
        error.message || 'An error occurred while processing the transaction.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private extractFeatures(transaction: Transaction): number[] {
    // Normalize and preprocess data to extract features for prediction
    const amount = transaction.amount; // Use original amount
    const userAge = transaction.userAge;
    const accountBalance = transaction.accountBalance;
    const transactionsInLast24h = transaction.transactionsInLast24h;
    const timeSinceLastTransaction = transaction.timeSinceLastTransaction;
    const transactionAmountDifference = transaction.transactionAmountDifference;

    // One-hot encoding for location and device type
    const location = transaction.location === 'New York' ? 1 : 0; // Adjust as needed
    const deviceType = transaction.currentDevice === 'mobile' ? 1 : 0; // Adjust as needed
    const lastDeviceType = transaction.lastDevice === 'mobile' ? 1 : 0; // Adjust as needed

    // Convert device IDs to numeric representations (you can use hashing for larger datasets)
    const currentDeviceId = this.hashDeviceId(transaction.currentDeviceId);
    const lastDeviceId = this.hashDeviceId(transaction.lastDeviceId);

    // Return the feature array (ensure it matches the model input shape)
    return [
      amount,
      userAge,
      accountBalance,
      transactionsInLast24h,
      timeSinceLastTransaction,
      transactionAmountDifference,
      location,
      deviceType,
      currentDeviceId,
      lastDeviceType,
      lastDeviceId,
    ];
  }

  // Simple hashing function for device ID (you can improve this based on your needs)
  private hashDeviceId(deviceId: string): number {
    let hash = 0;
    for (let i = 0; i < deviceId.length; i++) {
      hash = (hash << 5) - hash + deviceId.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
}
