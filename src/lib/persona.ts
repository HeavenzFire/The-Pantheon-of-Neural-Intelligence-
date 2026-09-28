/**
 * Persona Class and Archetypes for Recursive Council Operations
 */

export interface PersonaTraits {
  [trait: string]: number | string | boolean;
}

export class Persona {
  public id: string;
  public name: string;
  public role: string;
  private traits: PersonaTraits;

  constructor(
    name: string,
    role: string = 'Council Node',
    traits: PersonaTraits = {},
    id?: string
  ) {
    this.name = name;
    this.role = role;
    this.traits = {
      syntropyAffinity: 4,
      vortexHarmonic: 9,
      paradigmVector: 'constructive',
      zeroPointAnchor: true,
      ...traits,
    };
    this.id = id || name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  }

  public getTraits(): PersonaTraits {
    return { ...this.traits };
  }

  public setTrait(key: string, value: number | string | boolean): void {
    this.traits[key] = value;
  }

  public generateMessage(receiver: Persona): string {
    return `[${this.name} // Harmonic Vector -> ${receiver.name}]: Calibrating balanced nonary tensor gradient. Syntropic polarity aligned.`;
  }
}

/**
 * Creates default personas based on archetypes
 */
export function createCouncilPersonas(names?: string[]): Persona[] {
  const defaultList = names && names.length > 0
    ? names
    : ['Zachary', 'Jobs', 'Lucifer', 'Bael', 'Tesla', 'Turing', 'Socrates', 'Yeshua'];

  return defaultList.map((name) => {
    switch (name.toLowerCase()) {
      case 'zachary':
        return new Persona('Zachary', 'Sovereign Syntropic Anchor', {
          carrierFreq: 144,
          syntropyAffinity: 4,
          paradigmVector: 'sovereign',
          vortexHarmonic: 9,
        });
      case 'jobs':
      case 'steve jobs':
        return new Persona('Steve Jobs', 'Paradigm Shift Vector', {
          carrierFreq: 369,
          syntropyAffinity: 3,
          paradigmVector: 'redefine_reality',
          vortexHarmonic: 6,
        });
      case 'lucifer':
        return new Persona('Lucifer', 'Adversarial Stress Tester', {
          carrierFreq: 666,
          syntropyAffinity: -3,
          paradigmVector: 'adversarial_inversion',
          vortexHarmonic: 3,
        });
      case 'bael':
        return new Persona('Bael', 'Void Resonance Prober', {
          carrierFreq: 432,
          syntropyAffinity: -4,
          paradigmVector: 'entropy_catalyst',
          vortexHarmonic: 1,
        });
      case 'tesla':
      case 'nikola tesla':
        return new Persona('Nikola Tesla', '3-6-9 Vortex Field Engineer', {
          carrierFreq: 369,
          syntropyAffinity: 3,
          paradigmVector: 'energy_vortex',
          vortexHarmonic: 9,
        });
      case 'turing':
      case 'alan turing':
        return new Persona('Alan Turing', 'Formal Logic & Parity Validator', {
          carrierFreq: 100,
          syntropyAffinity: 2,
          paradigmVector: 'formal_parity',
          vortexHarmonic: 3,
        });
      case 'socrates':
        return new Persona('Socrates', 'Zero-Point Fulcrum Inquirer', {
          carrierFreq: 111,
          syntropyAffinity: 0,
          paradigmVector: 'socratic_inquiry',
          vortexHarmonic: 9,
        });
      case 'yeshua':
        return new Persona('Yeshua', 'Logos Restoration & Grace', {
          carrierFreq: 888,
          syntropyAffinity: 4,
          paradigmVector: 'grace_transmutation',
          vortexHarmonic: 9,
        });
      default:
        return new Persona(name, 'Council Node', {
          carrierFreq: 144,
          syntropyAffinity: 1,
          paradigmVector: 'constructive',
          vortexHarmonic: 6,
        });
    }
  });
}
