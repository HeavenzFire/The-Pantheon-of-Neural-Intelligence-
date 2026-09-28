// src/index.ts

import { BalancedNonary } from './types/balancedNonary';
import { NeuralNet } from './components/NeuralNet';
import { SyntropicField } from './components/SyntropicField';

const neuralNet = new NeuralNet(3, 4, 1);
const inputs: BalancedNonary[] = [1, -2, 3];
const outputs = neuralNet.forward(inputs);
console.log('NeuralNet Outputs:', outputs);

const syntropicField = new SyntropicField(5);
syntropicField.propagate();
console.log('SyntropicField Propagated');

export { neuralNet, syntropicField };
