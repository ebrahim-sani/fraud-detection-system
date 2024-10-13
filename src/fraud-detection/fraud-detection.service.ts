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
      tf.layers.dense({ units: 16, inputShape: [12], activation: 'relu' }),
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
      [500.75, 1, 1, 1, 450.0, 30, 2000.0, 3, 3600, 50.75], // T001
      [1500.0, 2, 2, 2, 100.0, 42, 5000.0, 1, 7200, 1400.0], // T002
      [30.0, 3, 4, 3, 25.0, 25, 100.0, 5, 300, 5.0], // T003
      [7000.0, 4, 5, 4, 1000.0, 34, 15000.0, 2, 14400, 6000.0], // T004
      [200.0, 1, 1, 1, 500.75, 30, 1500.0, 4, 1800, -300.75], // T005
      [50.0, 7, 7, 7, 20.0, 28, 500.0, 3, 3600, 30.0], // T006
      [10000.0, 6, 8, 6, 5000.0, 40, 20000.0, 1, 10800, 5000.0], // T007
      [75.5, 2, 2, 2, 1500.0, 42, 1500.0, 2, 3600, -1424.5], // T008
      [500.0, 7, 10, 10, 2500.0, 38, 10000.0, 1, 5400, -2000.0], // T009
      [20.0, 3, 4, 3, 30.0, 25, 80.0, 6, 900, -10.0], // T010
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
