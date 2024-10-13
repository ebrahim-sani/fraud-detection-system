import { Injectable, OnModuleInit } from '@nestjs/common';
import * as tf from '@tensorflow/tfjs-node';

@Injectable()
export class FraudDetectionService implements OnModuleInit {
  private model: tf.Sequential;

  async onModuleInit() {
    await this.buildAndTrainModel();
  }

  async buildAndTrainModel() {
    this.model = tf.sequential();
    this.model.add(
      tf.layers.dense({ units: 16, inputShape: [14], activation: 'relu' }),
    );

    this.model.add(tf.layers.dense({ units: 8, activation: 'relu' }));
    this.model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

    this.model.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy'],
    });

    // Dummy data for training
    const xs = tf.tensor2d([
      [
        500.75, // Transaction amount
        1, // Transaction type
        3600, // Transaction date & time (seconds since start of day)
        1, // Location
        -1594253637, // Current device ID (hashed)
        -1594253637, // Last device ID (hashed)
        1, // Last transaction location
        450.0, // Last transaction amount
        2000.0, // Account balance before transaction
        3, // Transactions in last 24 hours
        3600, // Time since last transaction (seconds)
        50.75, // Transaction amount difference
        1, // Device Type
        1, // Last Device Type
      ], // T001
      [
        1500.0, 2, 7200, 2, -1594253637, -1594253637, 2, 100.0, 5000.0, 1, 7200,
        1400.0, 1, 1,
      ], // T002
      [
        30.0, 3, 300, 3, -1594253637, -1594253637, 4, 25.0, 100.0, 5, 300, 5.0,
        1, 1,
      ], // T003
      [
        7000.0, 4, 14400, 4, -1594253637, -1594253637, 5, 1000.0, 15000.0, 2,
        14400, 6000.0, 1, 1,
      ], // T004
      [
        200.0, 1, 1800, 1, -1594253637, -1594253637, 1, 500.75, 1500.0, 4, 1800,
        -300.75, 1, 1,
      ], // T005
      [
        50.0, 7, 3600, 7, -1594253637, -1594253637, 7, 20.0, 500.0, 3, 3600,
        30.0, 1, 1,
      ], // T006
      [
        10000.0, 6, 10800, 6, -1594253637, -1594253637, 8, 5000.0, 20000.0, 1,
        10800, 5000.0, 1, 1,
      ], // T007
      [
        75.5, 2, 3600, 2, -1594253637, -1594253637, 2, 1500.0, 1500.0, 2, 3600,
        -1424.5, 1, 1,
      ], // T008
      [
        500.0, 7, 5400, 10, -1594253637, -1594253637, 10, 2500.0, 10000.0, 1,
        5400, -2000.0, 1, 1,
      ], // T009
      [
        20.0, 3, 900, 3, -1594253637, -1594253637, 4, 30.0, 80.0, 6, 900, -10.0,
        1, 1,
      ], // T010
    ]);

    const ys = tf.tensor2d([
      [0], // T001
      [1], // T002
      [0], // T003
      [1], // T004
      [0], // T005
      [0], // T006
      [1], // T007
      [0], // T008
      [1], // T009
      [0], // T010
    ]);

    await this.model.fit(xs, ys, { epochs: 10 });
    console.log('Model training completed.');
  }

  async predict(features: number[]): Promise<number> {
    const inputTensor = tf.tensor2d([features]);
    const prediction = this.model.predict(inputTensor) as tf.Tensor;
    const predictionValue = (await prediction.data())[0];
    return predictionValue;
  }
}
