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
    const lastTransactionAmount = transaction.lastTransactionAmount;
    const time = this.convertDateAndTimeToNumbers(transaction.time);
    const accountBalance = transaction.accountBalance;
    const transactionsInLast24h = transaction.transactionsInLast24h;
    const timeSinceLastTransaction = transaction.timeSinceLastTransaction;
    const transactionAmountDifference = transaction.transactionAmountDifference;
    const transactionType = this.hashString(transaction.transactionType);
    const lastTransactionLocation = this.hashString(
      transaction.lastTransactionLocation,
    );

    // One-hot encoding for location and device type
    const location = this.hashString(transaction.location);
    const deviceType = transaction.currentDevice === 'mobile' ? 1 : 0;
    const lastDeviceType = transaction.lastDevice === 'mobile' ? 1 : 0;

    // Convert device IDs to numeric representations (you can use hashing for larger datasets)
    const currentDeviceId = this.hashString(transaction.currentDeviceId);
    const lastDeviceId = this.hashString(transaction.lastDeviceId);

    // Return the feature array (ensure it matches the model input shape)
    return [
      amount,
      transactionType,
      parseInt(time),
      location,
      currentDeviceId,
      lastDeviceId,
      lastTransactionLocation,
      lastTransactionAmount,
      accountBalance,
      transactionsInLast24h,
      timeSinceLastTransaction,
      transactionAmountDifference,
      deviceType,
      lastDeviceType,
    ];
  }

  // Simple hashing function for device ID (you can improve this based on your needs)
  private hashString(deviceId: string): number {
    let hash = 0;
    for (let i = 0; i < deviceId.length; i++) {
      hash = (hash << 5) - hash + deviceId.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  private convertDateAndTimeToNumbers(dateTimeString: string) {
    const dateTime = new Date(dateTimeString);

    const year = dateTime.getFullYear();
    const month = dateTime.getMonth() + 1;
    const day = dateTime.getDate();
    const hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();
    const seconds = dateTime.getSeconds();

    const numberString = `${year}${month}${day}${hours}${minutes}${seconds}`;
    return numberString;
  }
}
