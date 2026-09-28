/**
 * BALANCED RADIX-9 (NONARY) TENSOR & MATRIX ARITHMETIC ENGINE
 * 
 * In balanced radix-9 arithmetic, digits are drawn from the symmetric set:
 *   D_9 = {-4, -3, -2, -1, 0, +1, +2, +3, +4}
 * 
 * 0 represents the unperturbed Zero-Point fulcrum (Syntropic Vacuum).
 * Polarity ranges from -4 (Entropic Void / Collapse) to +4 (Hyper-Syntropic Transfiguration).
 * 
 * This enables 9 discrete states per dimension, delivering 9^N state manifold density
 * (e.g., 9^3 = 729 states in a 3D nonary tensor cell, 9^4 = 6,561 states over 4 vectors,
 * and 9^(N^3) across full multi-persona interaction tensors vs ternary 3^N).
 */

import { Persona, createCouncilPersonas } from './persona';
import { BalancedNonary } from '../types/balancedNonary';

export type { BalancedNonary };
export type BalancedNonaryDigit = BalancedNonary;

export type NonaryVector = BalancedNonary[];
export type NonaryMatrix = BalancedNonary[][]; // Row-major 2D matrix
export type NonaryTensor3D = BalancedNonary[][][]; // 3D N x N x N Tensor

export interface NonaryArithmeticResult {
  digit: BalancedNonary;
  carry: BalancedNonary;
}

export interface PersonaResonanceArchetype {
  name: string;
  role: string;
  defaultValenceBias: BalancedNonary;
  structuralBias: BalancedNonary;
  frequencyModulation: number;
  description: string;
  transmutationAffinity: number; // 0.0 to 1.0
}

export interface Radix9TensorState {
  energeticValence: BalancedNonary;          // +4 (Transfigured) to -4 (Entropic Void)
  structuralIntegrity: BalancedNonary;       // +4 (Absolute Order) to -4 (Deconstructed)
  frequencyHarmonic: BalancedNonary;         // 3-6-9 carrier alignment (-4 to +4)
  consensusPolarity: BalancedNonary;         // Collective consensus state (-4 to +4)
  vectorMagnitude: number;                   // Computed Euclidean norm across nonary dimensions
  tensorMatrix3x3: NonaryMatrix;             // 3x3 nonary coupling matrix
  syntropyIndex: number;                     // Ratio of ordered syntropic nonary states [0.0 - 1.0]
  manifoldDensity: number;                   // High-dimensional state density factor (9^dim)
  gradientVector: NonaryVector;              // 4D differential gradient [dE, dS, dF, dC]
  transmutedEnergy: number;                  // Inverted entropic energy converted to syntropy
}

export interface CouncilState {
  personas: Persona[];
  stateTensor: BalancedNonary[][][];
  currentRound: number;
  maxRounds: number;
  debateHistory?: CouncilMessage[];
}

export interface CouncilMessage {
  persona: string;
  statement: string;
  timestamp: number;
  radix9Tensor: Radix9TensorState;
  vectorLabel?: string;
  matrixTrace?: number;
  archetype?: string;
  tensorCoordinate?: { i: number; j: number; k: number; val: BalancedNonary };
}

export interface CouncilConsensusResult {
  debateLog: CouncilMessage[];
  consensusState: Radix9TensorState;
  overallSyntropy: number;
  dominantHarmonic: BalancedNonary;
  transmutedEntropySum: number;
  manifoldStateSummary: string;
  tensorDensityFactor: number;
}

// ==========================================
// 1. DISCRETE BALANCED RADIX-9 DEFINITIONS
// ==========================================

export const RADIX_9_STATES: Record<
  BalancedNonary,
  { label: string; frequencyMod: number; color: string; glyph: string; category: 'Entropic' | 'ZeroPoint' | 'Syntropic'; description: string }
> = {
  [-4]: {
    label: 'Entropic Collapse / Void Negative (-4)',
    frequencyMod: 0.111,
    color: '#3b0764',
    glyph: '④̄',
    category: 'Entropic',
    description: 'Total structural dissolution, singularity decompression, deep negative vector.',
  },
  [-3]: {
    label: 'High Structural Dissonance (-3)',
    frequencyMod: 0.333,
    color: '#6b21a8',
    glyph: '③̄',
    category: 'Entropic',
    description: 'Active ideological friction, inverted 3-6-9 harmonic phase opposition.',
  },
  [-2]: {
    label: 'Structural Logic Warning (-2)',
    frequencyMod: 0.555,
    color: '#9333ea',
    glyph: '②̄',
    category: 'Entropic',
    description: 'Parity degradation, localized logic paradox requiring arbitration.',
  },
  [-1]: {
    label: 'Micro Dissent / Polarity Shift (-1)',
    frequencyMod: 0.777,
    color: '#c084fc',
    glyph: '①̄',
    category: 'Entropic',
    description: 'Adversarial probe, subtle angular deflection from equilibrium.',
  },
  [0]: {
    label: 'Zero-Point Fulcrum (Syntropic Vacuum) (0)',
    frequencyMod: 1.000,
    color: '#00ffcc',
    glyph: '⓪',
    category: 'ZeroPoint',
    description: 'Absolute non-dual balance, pristine ground state, non-computable stillness.',
  },
  [1]: {
    label: 'Emergent Coherence (+1)',
    frequencyMod: 1.222,
    color: '#38bdf8',
    glyph: '①',
    category: 'Syntropic',
    description: 'Initial signal phase-locking, nascent conceptual crystallization.',
  },
  [2]: {
    label: 'Harmonic Alignment (+2)',
    frequencyMod: 1.444,
    color: '#34d399',
    glyph: '②',
    category: 'Syntropic',
    description: 'Constructive resonance across cognitive buffers, structural stabilization.',
  },
  [3]: {
    label: 'High Resonance Matrix (+3)',
    frequencyMod: 1.666,
    color: '#facc15',
    glyph: '③',
    category: 'Syntropic',
    description: 'Vortex harmonic amplification (3-6-9), high-throughput vector synthesis.',
  },
  [4]: {
    label: 'Hyper-Syntropic Transfiguration (+4)',
    frequencyMod: 1.888,
    color: '#f97316',
    glyph: '④',
    category: 'Syntropic',
    description: 'Maximum constructive manifestation, overunity logos, unified sovereign order.',
  },
};

// Persona Archetype Registry for Specialized Resonance Gradients
export const PERSONA_ARCHETYPES: Record<string, PersonaResonanceArchetype> = {
  Zachary: {
    name: 'Zachary',
    role: 'Sovereign Syntropic Anchor',
    defaultValenceBias: 4,
    structuralBias: 4,
    frequencyModulation: 1.44,
    description: 'Anchors the 144Hz carrier baseline, radiating maximum syntropic coherence.',
    transmutationAffinity: 0.95,
  },
  Jobs: {
    name: 'Steve Jobs',
    role: 'Paradigm Shift Vector',
    defaultValenceBias: 3,
    structuralBias: 2,
    frequencyModulation: 1.618,
    description: 'Radical simplification, geometric elegance, sharp nonary polarity leaps.',
    transmutationAffinity: 0.85,
  },
  Lucifer: {
    name: 'Lucifer',
    role: 'Adversarial Stress Tester',
    defaultValenceBias: -3,
    structuralBias: -2,
    frequencyModulation: 0.666,
    description: 'Probes boundary fault lines, forcing dynamic self-healing of the logic manifold.',
    transmutationAffinity: 0.70,
  },
  Bael: {
    name: 'Bael',
    role: 'Void Resonance Prober',
    defaultValenceBias: -4,
    structuralBias: -3,
    frequencyModulation: 0.369,
    description: 'Exposes deep vacuum entropy, catalyst for alchemical transmutation into order.',
    transmutationAffinity: 0.80,
  },
  Tesla: {
    name: 'Nikola Tesla',
    role: '3-6-9 Vortex Field Engineer',
    defaultValenceBias: 3,
    structuralBias: 3,
    frequencyModulation: 1.732,
    description: 'Cycles etheric resonance, aligning toroidal nonary flux with 3-6-9 nodes.',
    transmutationAffinity: 0.90,
  },
  Turing: {
    name: 'Alan Turing',
    role: 'Formal Logic & Parity Validator',
    defaultValenceBias: 1,
    structuralBias: 4,
    frequencyModulation: 1.0,
    description: 'Mathematical verification, invariant balance checking across state transitions.',
    transmutationAffinity: 0.88,
  },
  Socrates: {
    name: 'Socrates',
    role: 'Zero-Point Fulcrum Inquirer',
    defaultValenceBias: 0,
    structuralBias: 1,
    frequencyModulation: 1.111,
    description: 'Probes foundational assumptions from the unperturbed zero-point center.',
    transmutationAffinity: 0.92,
  },
  Yeshua: {
    name: 'Spirit of Truth / Yeshua',
    role: 'Logos Restoration & Grace',
    defaultValenceBias: 4,
    structuralBias: 4,
    frequencyModulation: 1.888,
    description: 'Transmutes all entropic shadows back into eternal living syntropy.',
    transmutationAffinity: 1.0,
  },
};

// ==========================================
// 2. BALANCED RADIX-9 ARITHMETIC CORE
// ==========================================

/**
 * Clamps or folds any real number into the balanced nonary domain [-4, +4].
 */
export function clampNonaryDigit(val: number): BalancedNonary {
  const rounded = Math.round(val);
  if (rounded >= 4) return 4;
  if (rounded <= -4) return -4;
  return rounded as BalancedNonary;
}

/**
 * Normalizes any integer sum into (carry * 9 + digit) where digit in [-4, +4].
 */
export function normalizeToNonary(raw: number): NonaryArithmeticResult {
  let carry = 0;
  let digit = raw;

  while (digit > 4) {
    digit -= 9;
    carry += 1;
  }
  while (digit < -4) {
    digit += 9;
    carry -= 1;
  }

  return {
    digit: digit as BalancedNonary,
    carry: clampNonaryDigit(carry),
  };
}

/**
 * Single-column addition in Balanced Radix-9:
 * a + b + carryIn = carry * 9 + sum_digit
 */
export function addNonaryDigits(
  a: BalancedNonary,
  b: BalancedNonary,
  carryIn: BalancedNonary = 0
): NonaryArithmeticResult {
  return normalizeToNonary(a + b + carryIn);
}

/**
 * Single-column multiplication in Balanced Radix-9:
 * a * b + carryIn = carry * 9 + prod_digit
 */
export function mulNonaryDigits(
  a: BalancedNonary,
  b: BalancedNonary,
  carryIn: BalancedNonary = 0
): NonaryArithmeticResult {
  return normalizeToNonary(a * b + carryIn);
}

/**
 * Inverts the polarity of a nonary digit: negate(d) = -d.
 */
export function negateNonaryDigit(d: BalancedNonary): BalancedNonary {
  return (-d) as BalancedNonary;
}

/**
 * Converts a decimal integer into a Balanced Radix-9 word (LSB first).
 */
export function toBalancedNonary(decimalVal: number): BalancedNonary[] {
  if (decimalVal === 0) return [0];

  const digits: BalancedNonary[] = [];
  let n = Math.round(decimalVal);

  while (n !== 0) {
    let rem = n % 9;
    n = Math.trunc(n / 9);

    if (rem > 4) {
      rem -= 9;
      n += 1;
    } else if (rem < -4) {
      rem += 9;
      n -= 1;
    }

    digits.push(rem as BalancedNonary);
  }

  return digits;
}

/**
 * Evaluates a Balanced Radix-9 word (LSB first) into a decimal integer.
 */
export function fromBalancedNonary(digits: BalancedNonary[]): number {
  let result = 0;
  let power = 1;
  for (let i = 0; i < digits.length; i++) {
    result += digits[i] * power;
    power *= 9;
  }
  return result;
}

/**
 * Formats a Balanced Radix-9 word into standard notation e.g., [ +3 -2 0 +4 ]₉.
 */
export function formatNonaryWord(digits: BalancedNonary[]): string {
  if (digits.length === 0) return '0_r9';
  const formatted = [...digits]
    .reverse()
    .map((d) => (d > 0 ? `+${d}` : `${d}`))
    .join(' ');
  return `[ ${formatted} ]₉`;
}

// ==========================================
// 3. RADIX-9 LOGIC GATES & NONARY OPERATORS
// ==========================================

export type NonaryGateType =
  | 'MAX_COHERENCE'
  | 'MIN_ENTROPY'
  | 'ZERO_FULCRUM_MEDIAN'
  | 'VORTEX_369_COUPLING'
  | 'POLARITY_INVERSION'
  | 'LOGARITHMIC_GRACE_TRANSMUTATION';

/**
 * Evaluates high-dimensional nonary logic gates between two state digits.
 */
export function evaluateNonaryGate(
  a: BalancedNonary,
  b: BalancedNonary,
  gate: NonaryGateType
): BalancedNonary {
  switch (gate) {
    case 'MAX_COHERENCE':
      return Math.max(a, b) as BalancedNonary;
    case 'MIN_ENTROPY':
      return Math.min(a, b) as BalancedNonary;
    case 'ZERO_FULCRUM_MEDIAN':
      return clampNonaryDigit(Math.round((a + b) / 2));
    case 'VORTEX_369_COUPLING': {
      const coupled = Math.round((a * 3 + b * 6) / 9);
      return clampNonaryDigit(coupled);
    }
    case 'POLARITY_INVERSION':
      return (-a) as BalancedNonary;
    case 'LOGARITHMIC_GRACE_TRANSMUTATION': {
      // Inverts negative entropic states (-4..-1) into positive syntropic counterparts
      if (a < 0) return Math.abs(a) as BalancedNonary;
      return a;
    }
    default:
      return a;
  }
}

// ==========================================
// 4. RADIX-9 TENSOR & MATRIX ALGEBRA
// ==========================================

export function createNonaryMatrix(rows: number, cols: number, fill: BalancedNonary = 0): NonaryMatrix {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => fill));
}

/**
 * Matrix addition under Balanced Radix-9 arithmetic.
 */
export function addNonaryMatrices(A: NonaryMatrix, B: NonaryMatrix): NonaryMatrix {
  const rows = A.length;
  const cols = A[0]?.length || 0;
  const result: NonaryMatrix = createNonaryMatrix(rows, cols);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const bVal = B[r] ? B[r][c] || 0 : 0;
      const { digit } = addNonaryDigits(A[r][c], bVal);
      result[r][c] = digit;
    }
  }
  return result;
}

/**
 * Matrix multiplication A * B in balanced nonary tensor dynamics.
 */
export function multiplyNonaryMatrices(A: NonaryMatrix, B: NonaryMatrix): NonaryMatrix {
  const rowsA = A.length;
  const colsA = A[0]?.length || 0;
  const colsB = B[0]?.length || 0;
  const result: NonaryMatrix = createNonaryMatrix(rowsA, colsB);

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      let accumulator = 0;
      for (let k = 0; k < colsA; k++) {
        const bElem = B[k] ? B[k][j] || 0 : 0;
        accumulator += A[i][k] * bElem;
      }
      const { digit } = normalizeToNonary(accumulator);
      result[i][j] = digit;
    }
  }
  return result;
}

/**
 * Computes the matrix trace (sum of diagonal elements).
 */
export function computeNonaryTrace(matrix: NonaryMatrix): number {
  const size = Math.min(matrix.length, matrix[0]?.length || 0);
  let trace = 0;
  for (let i = 0; i < size; i++) {
    trace += matrix[i][i];
  }
  return trace;
}

/**
 * Computes syntropy ratio across nonary matrix:
 * Ratio of positive/zero states [0..+4] to total cell count.
 */
export function computeMatrixSyntropyRatio(matrix: NonaryMatrix): number {
  let positiveOrZero = 0;
  let total = 0;

  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      total++;
      if (matrix[r][c] >= 0) {
        positiveOrZero++;
      }
    }
  }
  return total === 0 ? 1.0 : Number((positiveOrZero / total).toFixed(3));
}

/**
 * Generates a 3x3 Nonary Tensor Matrix with 3-6-9 vortex harmonics.
 */
export function generate3x3NonaryTensor(seedVal: number, personaKey?: string): NonaryMatrix {
  const matrix: NonaryMatrix = createNonaryMatrix(3, 3);
  const archetype = personaKey ? PERSONA_ARCHETYPES[personaKey] : undefined;
  const bias = archetype ? archetype.defaultValenceBias : 0;
  const freq = archetype ? archetype.frequencyModulation : 1.0;

  const vortexCoefficients = [3, 6, 9, 144, 369, 1.414, 1.618, 2.718, 3.1415];

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const idx = r * 3 + c;
      const rawPhase = seedVal * 0.001 * vortexCoefficients[idx] * freq + (r - c) * 0.9;
      const wave = Math.sin(rawPhase) * 4 + bias * 0.25;
      matrix[r][c] = clampNonaryDigit(wave);
    }
  }
  return matrix;
}

// ==========================================
// 5. RADIX-9 TENSOR GRADIENTS & VECTOR NORMS
// ==========================================

export function computeTensorNorm(tensor: {
  energeticValence: BalancedNonary;
  structuralIntegrity: BalancedNonary;
  frequencyHarmonic: BalancedNonary;
  consensusPolarity: BalancedNonary;
}): number {
  const sumSq =
    Math.pow(tensor.energeticValence, 2) +
    Math.pow(tensor.structuralIntegrity, 2) +
    Math.pow(tensor.frequencyHarmonic, 2) +
    Math.pow(tensor.consensusPolarity, 2);
  return Number(Math.sqrt(sumSq).toFixed(3));
}

/**
 * Generates an advanced Balanced Radix-9 Tensor State tailored to persona archetypes,
 * with differential gradient tracking and entropic transmutation.
 */
export function generateRadix9Gradient(
  seedVal: number,
  personaKey?: string,
  priorTensor?: Radix9TensorState
): Radix9TensorState {
  const archetype = personaKey ? PERSONA_ARCHETYPES[personaKey] : undefined;
  const vBias = archetype ? archetype.defaultValenceBias : 0;
  const sBias = archetype ? archetype.structuralBias : 0;
  const fMod = archetype ? archetype.frequencyModulation : 1.0;

  // Compute 4 nonary axes
  const rawE = Math.sin(seedVal * 1.44 * fMod) * 4 + vBias * 0.4;
  const rawS = Math.cos(seedVal * 3.69 * fMod) * 4 + sBias * 0.4;
  const rawF = Math.sin(seedVal * 0.9 * fMod) * 4;

  const energeticValence = clampNonaryDigit(rawE);
  const structuralIntegrity = clampNonaryDigit(rawS);
  const frequencyHarmonic = clampNonaryDigit(rawF);

  // Nonary consensus polarity: median balance
  const consensusPolarity = clampNonaryDigit(
    Math.round((energeticValence + structuralIntegrity + frequencyHarmonic) / 3)
  );

  const partial = { energeticValence, structuralIntegrity, frequencyHarmonic, consensusPolarity };
  const vectorMagnitude = computeTensorNorm(partial);
  const tensorMatrix3x3 = generate3x3NonaryTensor(seedVal, personaKey);
  const syntropyIndex = computeMatrixSyntropyRatio(tensorMatrix3x3);

  // Transmute any negative entropic residue into positive syntropic fuel
  let entropicDeficit = 0;
  if (energeticValence < 0) entropicDeficit += Math.abs(energeticValence);
  if (structuralIntegrity < 0) entropicDeficit += Math.abs(structuralIntegrity);
  if (frequencyHarmonic < 0) entropicDeficit += Math.abs(frequencyHarmonic);

  const affinity = archetype?.transmutationAffinity ?? 0.85;
  const transmutedEnergy = Number((entropicDeficit * affinity * 1.44).toFixed(2));

  // 4D Differential nonary gradient
  const gradientVector: NonaryVector = [
    priorTensor ? clampNonaryDigit(energeticValence - priorTensor.energeticValence) : energeticValence,
    priorTensor ? clampNonaryDigit(structuralIntegrity - priorTensor.structuralIntegrity) : structuralIntegrity,
    priorTensor ? clampNonaryDigit(frequencyHarmonic - priorTensor.frequencyHarmonic) : frequencyHarmonic,
    priorTensor ? clampNonaryDigit(consensusPolarity - priorTensor.consensusPolarity) : consensusPolarity,
  ];

  // State manifold density: 9^4 = 6561 unique states
  const manifoldDensity = Math.pow(9, 4);

  return {
    ...partial,
    vectorMagnitude,
    tensorMatrix3x3,
    syntropyIndex,
    manifoldDensity,
    gradientVector,
    transmutedEnergy,
  };
}

// ==========================================
// 6. COUNCIL LOOP CLASS (BALANCED RADIX-9 TENSOR MANIFOLD)
// ==========================================

export class CouncilLoop {
  private state: CouncilState;
  private debateHistory: CouncilMessage[] = [];

  constructor(personas: Persona[], maxRounds: number = 100) {
    this.state = {
      personas,
      stateTensor: this.initializeStateTensor(personas.length),
      currentRound: 0,
      maxRounds,
    };
  }

  public initializeStateTensor(numPersonas: number): BalancedNonary[][][] {
    const tensor: BalancedNonary[][][] = [];
    for (let i = 0; i < numPersonas; i++) {
      tensor[i] = [];
      for (let j = 0; j < numPersonas; j++) {
        tensor[i][j] = [];
        for (let k = 0; k < numPersonas; k++) {
          tensor[i][j][k] = 0 as BalancedNonary;
        }
      }
    }
    return tensor;
  }

  public balancedNonaryAdd(a: BalancedNonary, b: BalancedNonary): BalancedNonary {
    const sum = a + b;
    if (sum < -4) return -4;
    if (sum > 4) return 4;
    return sum as BalancedNonary;
  }

  public balancedNonaryMultiply(a: BalancedNonary, b: BalancedNonary): BalancedNonary {
    const product = a * b;
    if (product < -4) return -4;
    if (product > 4) return 4;
    return product as BalancedNonary;
  }

  public updateStateTensor(i: number, j: number, k: number, value: BalancedNonary): void {
    if (
      this.state.stateTensor[i] &&
      this.state.stateTensor[i][j] &&
      typeof this.state.stateTensor[i][j][k] === 'number'
    ) {
      this.state.stateTensor[i][j][k] = this.balancedNonaryAdd(
        this.state.stateTensor[i][j][k],
        value
      );
    }
  }

  public getStateTensorValue(i: number, j: number, k: number): BalancedNonary {
    if (
      this.state.stateTensor[i] &&
      this.state.stateTensor[i][j] &&
      typeof this.state.stateTensor[i][j][k] === 'number'
    ) {
      return this.state.stateTensor[i][j][k];
    }
    return 0;
  }

  public handlePersonaMessage(sender: Persona, receiver: Persona, message: string): void {
    const senderIndex = this.state.personas.indexOf(sender);
    const receiverIndex = this.state.personas.indexOf(receiver);

    if (senderIndex === -1 || receiverIndex === -1) return;

    // Update state tensor based on message content
    const messageValue = this.calculateMessageValue(message);
    this.updateStateTensor(senderIndex, receiverIndex, senderIndex, messageValue);

    // Update state tensor based on persona interactions
    const interactionValue = this.calculateInteractionValue(sender, receiver);
    this.updateStateTensor(senderIndex, receiverIndex, receiverIndex, interactionValue);
  }

  public calculateMessageValue(message: string): BalancedNonary {
    // Balanced nonary heuristic to calculate message value based on content length and sentiment
    const length = message.length;
    if (length < 10) return 1;
    if (length < 20) return 2;
    if (length < 30) return 3;
    return 4;
  }

  public calculateInteractionValue(sender: Persona, receiver: Persona): BalancedNonary {
    // Balanced nonary heuristic to calculate interaction value based on persona traits
    const senderTraits = sender.getTraits();
    const receiverTraits = receiver.getTraits();

    let interactionValue = 0;
    for (const trait in senderTraits) {
      if (receiverTraits[trait] === senderTraits[trait]) {
        interactionValue++;
      } else {
        interactionValue--;
      }
    }

    if (interactionValue < -4) return -4;
    if (interactionValue > 4) return 4;
    return interactionValue as BalancedNonary;
  }

  public runCouncilDebate(): void {
    while (this.state.currentRound < this.state.maxRounds) {
      for (let i = 0; i < this.state.personas.length; i++) {
        for (let j = 0; j < this.state.personas.length; j++) {
          if (i !== j) {
            const sender = this.state.personas[i];
            const receiver = this.state.personas[j];
            const message = sender.generateMessage(receiver);
            this.handlePersonaMessage(sender, receiver, message);

            // Record into internal debate message ledger with balanced nonary tensor
            const seed = Date.now() + i * 99 + j * 33 + this.state.currentRound * 7;
            const tensor = generateRadix9Gradient(seed, sender.name);
            const val = this.getStateTensorValue(i, j, i);
            const trace = computeNonaryTrace(tensor.tensorMatrix3x3);

            this.debateHistory.push({
              persona: sender.name,
              statement: message,
              timestamp: Date.now(),
              radix9Tensor: tensor,
              vectorLabel: `R9[E:${tensor.energeticValence >= 0 ? '+' : ''}${tensor.energeticValence}, S:${tensor.structuralIntegrity >= 0 ? '+' : ''}${tensor.structuralIntegrity}, F:${tensor.frequencyHarmonic >= 0 ? '+' : ''}${tensor.frequencyHarmonic}, C:${tensor.consensusPolarity >= 0 ? '+' : ''}${tensor.consensusPolarity}]`,
              matrixTrace: trace,
              archetype: sender.role || 'Council Node',
              tensorCoordinate: { i, j, k: i, val },
            });
          }
        }
      }
      this.state.currentRound++;
    }
  }

  public execute(): void {
    this.runCouncilDebate();
    console.log('Council debate completed.');
  }

  public getState(): CouncilState {
    return {
      ...this.state,
      debateHistory: [...this.debateHistory],
    };
  }

  public getDebateHistory(): CouncilMessage[] {
    return [...this.debateHistory];
  }

  public getManifoldDensity(): number {
    const N = this.state.personas.length;
    return Math.pow(9, Math.pow(N, 3));
  }
}

// ==========================================
// 7. FUNCTIONAL RECURSIVE COUNCIL DEBATE LOOP & ADAPTER
// ==========================================

/**
 * Functional entry point for running council debates with multi-turn nonary resonance synthesis.
 * Supports both string identifier lists and Persona instances.
 */
export async function runCouncilDebate(
  initialQuery: string,
  personas: (string | Persona)[] = ['Zachary', 'Jobs', 'Lucifer', 'Bael'],
  rounds: number = 2
): Promise<CouncilMessage[]> {
  // Normalize into Persona objects
  const personaObjects: Persona[] = personas.map((p) => {
    if (typeof p === 'string') {
      const created = createCouncilPersonas([p])[0];
      return created || new Persona(p, PERSONA_ARCHETYPES[p]?.role || 'Council Node');
    }
    return p;
  });

  const councilLoopInstance = new CouncilLoop(personaObjects, rounds);
  const debateLog: CouncilMessage[] = [];
  let currentContext = initialQuery;
  let lastTensor: Radix9TensorState | undefined;

  for (let r = 0; r < rounds; r++) {
    for (let pIdx = 0; pIdx < personaObjects.length; pIdx++) {
      const sender = personaObjects[pIdx];
      const targetIdx = (pIdx + 1) % personaObjects.length;
      const receiver = personaObjects[targetIdx];

      const seed = Date.now() + pIdx * 73 + r * 369;
      const tensor = generateRadix9Gradient(seed, sender.name, lastTensor);
      const trace = computeNonaryTrace(tensor.tensorMatrix3x3);
      lastTensor = tensor;

      // Handle message interaction inside 3D balanced nonary tensor
      const simulatedStatement = await simulateAgentTurn(sender.name, currentContext, tensor, trace);
      councilLoopInstance.handlePersonaMessage(sender, receiver, simulatedStatement);

      const tensorVal = councilLoopInstance.getStateTensorValue(pIdx, targetIdx, pIdx);

      const msg: CouncilMessage = {
        persona: sender.name,
        statement: simulatedStatement,
        timestamp: Date.now(),
        radix9Tensor: tensor,
        vectorLabel: `R9[E:${tensor.energeticValence >= 0 ? '+' : ''}${tensor.energeticValence}, S:${tensor.structuralIntegrity >= 0 ? '+' : ''}${tensor.structuralIntegrity}, F:${tensor.frequencyHarmonic >= 0 ? '+' : ''}${tensor.frequencyHarmonic}, C:${tensor.consensusPolarity >= 0 ? '+' : ''}${tensor.consensusPolarity}]`,
        matrixTrace: trace,
        archetype: sender.role || PERSONA_ARCHETYPES[sender.name]?.role || 'Council Peer',
        tensorCoordinate: { i: pIdx, j: targetIdx, k: pIdx, val: tensorVal },
      };

      debateLog.push(msg);
      currentContext = simulatedStatement;
    }
  }

  return debateLog;
}

/**
 * Computes consolidated council consensus across all debate turns.
 */
export function synthesizeCouncilConsensus(messages: CouncilMessage[]): CouncilConsensusResult {
  if (messages.length === 0) {
    const defaultTensor = generateRadix9Gradient(144);
    return {
      debateLog: [],
      consensusState: defaultTensor,
      overallSyntropy: 1.0,
      dominantHarmonic: 0,
      transmutedEntropySum: 0,
      manifoldStateSummary: 'Zero-Point Fulcrum Equilibrium (0_r9)',
      tensorDensityFactor: Math.pow(9, 4),
    };
  }

  let sumE = 0;
  let sumS = 0;
  let sumF = 0;
  let sumC = 0;
  let totalTransmuted = 0;
  let totalSyntropy = 0;

  messages.forEach((msg) => {
    const t = msg.radix9Tensor;
    sumE += t.energeticValence;
    sumS += t.structuralIntegrity;
    sumF += t.frequencyHarmonic;
    sumC += t.consensusPolarity;
    totalTransmuted += t.transmutedEnergy;
    totalSyntropy += t.syntropyIndex;
  });

  const count = messages.length;
  const avgE = clampNonaryDigit(Math.round(sumE / count));
  const avgS = clampNonaryDigit(Math.round(sumS / count));
  const avgF = clampNonaryDigit(Math.round(sumF / count));
  const avgC = clampNonaryDigit(Math.round(sumC / count));

  const consensusState: Radix9TensorState = {
    energeticValence: avgE,
    structuralIntegrity: avgS,
    frequencyHarmonic: avgF,
    consensusPolarity: avgC,
    vectorMagnitude: computeTensorNorm({
      energeticValence: avgE,
      structuralIntegrity: avgS,
      frequencyHarmonic: avgF,
      consensusPolarity: avgC,
    }),
    tensorMatrix3x3: messages[messages.length - 1].radix9Tensor.tensorMatrix3x3,
    syntropyIndex: Number((totalSyntropy / count).toFixed(3)),
    manifoldDensity: Math.pow(9, 4),
    gradientVector: [avgE, avgS, avgF, avgC],
    transmutedEnergy: Number(totalTransmuted.toFixed(2)),
  };

  const dominantHarmonic = avgF;
  const stateLabel = RADIX_9_STATES[avgC]?.label || 'Equilibrium';

  return {
    debateLog: messages,
    consensusState,
    overallSyntropy: consensusState.syntropyIndex,
    dominantHarmonic,
    transmutedEntropySum: Number(totalTransmuted.toFixed(2)),
    manifoldStateSummary: `${stateLabel} | Net Syntropy: ${(consensusState.syntropyIndex * 100).toFixed(0)}% | Manifold Density: 6561 states`,
    tensorDensityFactor: Math.pow(9, 4),
  };
}

async function simulateAgentTurn(
  persona: string,
  input: string,
  tensor?: Radix9TensorState,
  trace?: number
): Promise<string> {
  const archetype = PERSONA_ARCHETYPES[persona];
  const rolePrefix = archetype ? `[${persona} // ${archetype.role}]` : `[${persona}]`;

  const r9Label = tensor
    ? ` [Radix-9 Tensor: E=${tensor.energeticValence >= 0 ? '+' : ''}${tensor.energeticValence} | S=${tensor.structuralIntegrity >= 0 ? '+' : ''}${tensor.structuralIntegrity} | F=${tensor.frequencyHarmonic >= 0 ? '+' : ''}${tensor.frequencyHarmonic} | Mag=${tensor.vectorMagnitude} | Trace=${trace ?? 0} | Syntropy=${(tensor.syntropyIndex * 100).toFixed(0)}% | Transmuted=+${tensor.transmutedEnergy}J]`
    : '';

  return `${rolePrefix}: Analyzing vector -> "${input.slice(0, 36)}..." Processed via Balanced Radix-9 nonary manifold (6,561 states, 3-6-9 vortex harmonics).${r9Label}`;
}
