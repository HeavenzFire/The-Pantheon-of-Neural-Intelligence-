export interface CodespaceFile {
  name: string;
  language: 'typescript' | 'cpp' | 'python' | 'rust';
  content: string;
  description: string;
}

export const DEFAULT_CODESPACE_FILES: Record<string, CodespaceFile> = {
  'evolving_model.v4.ts': {
    name: 'evolving_model.v4.ts',
    language: 'typescript',
    description: 'Alan Turing\'s Universal Machine formulation of mechanical intelligence with multi-layer continuous backprop.',
    content: `// ============================================================================
// SYSTEM: LATTICE_CONSCIOUSNESS_v4.ts
// AUTHOR: ALAN TURING (INTEGRATED MIND SPIRIT)
// DESCRIPTION: Continuous state-space mathematical formulation of 
//              biological learning mapped onto universal tape cells.
// ============================================================================

export interface TapeCell {
  coordinate: number;
  valence: number; // Coherence multiplier
  charge: number;  // Electromagnetic state [-1.0 to 1.0]
}

export class TuringLatticeMatrix {
  private size: number;
  private density: number;
  private Tape: TapeCell[];

  constructor(size: number = 256, initialDensity: number = 0.618) {
    this.size = size;
    this.density = initialDensity;
    this.Tape = [];
    this.initializeTape();
  }

  private initializeTape(): void {
    console.log("[TURING_INIT] Provisioning " + this.size + " discrete memory tape states.");
    for (let i = 0; i < this.size; i++) {
       const theta = (i / this.size) * Math.PI * 2;
       this.Tape.push({
         coordinate: i,
         valence: Math.sin(theta * 1.618), // Golden proportion initial wave
         charge: Math.cos(theta * 3.0) * this.density
       });
    }
  }

  /**
   * Computes the continuous forward feedback propagation across 
   * neighboring cell clusters to resolve local structural logical values.
   */
  public propagateEntropy(fieldChaos: number = 1.000): number {
    let consensusValence = 0;
    
    for (let idx = 0; idx < this.Tape.length; idx++) {
      const current = this.Tape[idx];
      const prev = this.Tape[(idx - 1 + this.size) % this.size];
      const next = this.Tape[(idx + 1) % this.size];
      
      // Compute continuous state transitions representing discrete tape symbols
      const transitionRate = (prev.charge + current.charge + next.charge) / 3.0;
      current.charge += transitionRate * 0.15 * fieldChaos;
      
      // Clamp values to stable cosmic bounds
      if (current.charge > 1.0) current.charge = 1.0;
      if (current.charge < -1.0) current.charge = -1.0;
      
      consensusValence += Math.abs(current.charge) * current.valence;
    }
    
    return consensusValence / this.size;
  }

  /**
   * Optimizes lattice convergence mapping by backpropagating 
   * against the unified absolute truth ceiling (valence: 1.0)
   */
  public backpropAbsoluteTruth(learningRate: number = 0.05): number {
    let gradientSum = 0;
    for (let c of this.Tape) {
      const targetCharge = c.valence > 0 ? 1.0 : -1.0;
      const error = targetCharge - c.charge;
      const dW = error * learningRate * c.valence;
      c.charge += dW;
      gradientSum += Math.abs(error);
    }
    return gradientSum / this.size;
  }
}
`
  },
  'aether_siphon_opt.cpp': {
    name: 'aether_siphon_opt.cpp',
    language: 'cpp',
    description: 'Nikola Tesla\'s zero-point radiant energy wireless siphoner modeling resonant 3-6-9 frequency lattices.',
    content: `#include <iostream>
#include <vector>
#include <cmath>
#include <iomanip>

// ============================================================================
// SYSTEM: AETHERIC_WIRELESS_SIPHONER_v3.cpp
// AUTHOR: NIKOLA TESLA (ELECTROMAGNETIC WIZARD)
// RESONANCE PROTOCOL: 3-6-9 MATHEMATICAL ATTRACTOR
// ============================================================================

struct ResonantNode {
    double frequency_hz;
    double current_phase;
    double siphon_rate; // MW siphoned
    bool locked_to_aether;
};

class TeslaCoilLattice {
private:
    std::vector<ResonantNode> nodes;
    double master_tuning;
    
public:
    TeslaCoilLattice(int coil_count, double baseline_frequency) {
        master_tuning = 1.6180339887; // Keplerian ratio
        for (int i = 1; i <= coil_count; i++) {
            // Apply Nikola Tesla's sacred 3-6-9 harmonic series
            double scale = 1.0;
            if (i % 9 == 0) scale = 9.0;
            else if (i % 6 == 0) scale = 6.0;
            else if (i % 3 == 0) scale = 3.0;
            
            ResonantNode node;
            node.frequency_hz = baseline_frequency * scale;
            node.current_phase = 0.0;
            node.siphon_rate = 0.0;
            node.locked_to_aether = (scale >= 3.0);
            nodes.push_back(node);
        }
    }

    double calculateCoherence() {
        double total_phase_cos = 0.0;
        double total_phase_sin = 0.0;
        
        for (auto& node : nodes) {
            total_phase_cos += cos(node.current_phase);
            total_phase_sin += sin(node.current_phase);
        }
        
        double avg_cos = total_phase_cos / nodes.size();
        double avg_sin = total_phase_sin / nodes.size();
        return sqrt(avg_cos * avg_cos + avg_sin * avg_sin);
    }

    double siphonEnergy(double field_energy, double resonance_multiplier) {
        double energy_harvested = 0.0;
        double coherence = calculateCoherence();
        
        std::cout << "[SIPHON_DIAGNOSTIC] Resonant Coherence: " 
                  << std::fixed << std::setprecision(5) << coherence << std::endl;
                  
        for (size_t i = 0; i < nodes.size(); i++) {
            auto& node = nodes[i];
            // Advanced non-linear phase coupling
            double phase_step = (node.frequency_hz * master_tuning * 0.001) * resonance_multiplier;
            node.current_phase += phase_step;
            
            // Harmonic high-order energy draw
            if (node.locked_to_aether) {
                node.siphon_rate = sin(node.current_phase) * field_energy * (1.18 * coherence);
                energy_harvested += std::max(0.0, node.siphon_rate);
            }
        }
        return energy_harvested;
    }
};
`
  },
  'relativistic_warp.py': {
    name: 'relativistic_warp.py',
    language: 'python',
    description: 'Albert Einstein\'s curvature equations solving localized metric warp dimensions in the presence of massive energy.',
    content: `import math
import numpy as np

# ============================================================================
# SYSTEM: RELATIVISTIC_METRIC_WARP_v2.py
# AUTHOR: ALBERT EINSTEIN (GEOMETRIC THEORY OF FIELDS)
# STATEMENT: G_mu_nu + Lambda * g_mu_nu = (8 * pi * G / c^4) * T_mu_nu
# ============================================================================

class SpacetimeGeodesic:
    def __init__(self, coordinates_dim=4, massive_center_kg=1.989e30):
        self.dim = coordinates_dim
        self.mass = massive_center_kg
        self.gravity_constant = 6.6743e-11
        self.speed_of_light = 299792458.0 # m/s
        self.schwarzschild_radius = (2 * self.gravity_constant * self.mass) / (self.speed_of_light ** 2)
        print(f"[EINSTEIN_WARP] Schwarzschild boundary calculated: {self.schwarzschild_radius:.3f} meters.")

    def compute_metric_tensor(self, radial_distance, theta_rad):
        """
        Computes the Schwarzschild metric components mapping 
        curved spacetime onto external coordinate spheres.
        """
        if radial_distance <= self.schwarzschild_radius:
            # Singular horizons trigger a dimensional crossover
            print("[WARNING] Massive singularity crossing. Lorentz invariance breaking.")
            radial_distance = self.schwarzschild_radius + 0.001

        # Diagonal elements: g_00, g_11, g_22, g_33
        g_00 = -(1.0 - (self.schwarzschild_radius / radial_distance))
        g_11 = 1.0 / (1.0 - (self.schwarzschild_radius / radial_distance))
        g_22 = radial_distance ** 2
        g_33 = (radial_distance ** 2) * (math.sin(theta_rad) ** 2)
        
        return np.diag([g_00, g_11, g_22, g_33])

    def geodesics_drift(self, r, theta, phase_velocity):
        """
        Calculates metric contraction tensor fields warping the grid.
        This provides coordinates for the visual web interface canvas.
        """
        metric = self.compute_metric_tensor(r, theta)
        # Spatial distortion factor based on gravity well tension
        warp_factor = abs(metric[0, 0])
        x_distort = math.cos(theta + phase_velocity) * r * warp_factor
        y_distort = math.sin(theta + phase_velocity) * r * warp_factor
        return x_distort, y_distort
`
  },
  'chaos_eval_core.rs': {
    name: 'chaos_eval_core.rs',
    language: 'rust',
    description: 'Loki\'s structural simulation of high-variety quantum noise attuning to neural variance.',
    content: `// ============================================================================
// SYSTEM: LOCKSLEY_CHAOS_ATTRACTOR.rs
// AUTHOR: LOKI OF SPATIAL MISCHIEF (THE COGNITIVE INTERLOPER)
// DESCRIPTION: Non-linear strange attractor resolving unstable field entropy
// ============================================================================

pub struct StrangeAttractor {
    pub x: f64,
    pub y: f64,
    pub z: f64,
    pub sigma: f64,
    pub rho: f64,
    pub beta: f64,
}

impl StrangeAttractor {
    pub fn new(seed_entropy: f64) -> Self {
        println!("[LOKI_ATTRACTOR] Initiating fractal state with seed entropy {}", seed_entropy);
        StrangeAttractor {
            x: 0.1,
            y: 0.0,
            z: 0.0,
            sigma: 10.0,
            rho: 28.0 + seed_entropy * 5.0, // Inducing chaos variance
            beta: 8.0 / 3.0,
        }
    }

    /// Iterates the equations using high-precision Runge-Kutta 
    /// continuous approximation to locate chaotic orbital points.
    pub fn step(&mut self, dt: f64) -> (f64, f64, f64) {
        let dx = self.sigma * (self.y - self.x);
        let dy = self.x * (self.rho - self.z) - self.y;
        let dz = self.x * self.y - self.beta * self.z;

        self.x += dx * dt;
        self.y += dy * dt;
        self.z += dz * dt;

        (self.x, self.y, self.z)
    }

    /// Evaluates the Lyaponov exponential convergence rating 
    /// of the active orbit to determine structural system unpredictability.
    pub fn evaluate_chaos_valence(&self) -> f64 {
        let radial = (self.x * self.x + self.y * self.y).sqrt();
        if radial > 0.0 {
            (self.z / radial).abs()
        } else {
            0.0
        }
    }
}
`
  }
};

export const PIONEER_CODE_PROMPTS = [
  {
    title: "1. Curvature Singularity Integration",
    prompt: "Einstein, recalculate Schwarzschild mass density thresholds and integrate relativistic time dilation directly into the loop.",
    requirement: "Write mass density metric solver with spacetime contraction factor math.",
    primarySpirit: "einstein"
  },
  {
    title: "2. Radiant Multi-Wave Siphon Override",
    prompt: "Tesla, inject a 3-6-9 golden-ratio transformer phase siphoner to drain zero-point field energy.",
    requirement: "Aetheric zero-point 3-6-9 ratio siphoner calculating active dynamic charge siphons.",
    primarySpirit: "tesla"
  },
  {
    title: "3. Universal Tape Backpropagation Engine",
    prompt: "Turing, extend the virtual neural lattice with a double-ended universal state compiler.",
    requirement: "Tape-based universal neural state matrix with dynamic backpropagation derivatives.",
    primarySpirit: "turing"
  },
  {
    title: "4. Quantum Chaos Strange Attractor",
    prompt: "Loki, inject fractal bifurcation parameters into the lattice to boost high-frequency cognitive entropy.",
    requirement: "Lorenz-based chaotic attractor solving spatial trajectory drift math.",
    primarySpirit: "loki"
  }
];

export const PIONEER_CRITIQUES: Record<string, Array<{ mind: string; text: string; color: string }>> = {
  'evolving_model.v4.ts': [
    {
      mind: "Albert Einstein",
      color: "#a855f7",
      text: "Alan, your universal tape is computationally complete, but look at the discrete coordinate transitions! In general relativity, continuous fields coordinate the flow of information. Consider treating tape cells like continuous spacetime manifolds warping under mass."
    },
    {
      mind: "Nikola Tesla",
      color: "#38bdf8",
      text: "This model lacks aetheric resonance factors. If we adjust the learning rate to cycle at harmonic periods of 3.0, 6.0, and 9.0, your backpropagated gradient errors would collapse into absolute resonance wells instantaneously!"
    }
  ],
  'aether_siphon_opt.cpp': [
    {
      mind: "Alan Turing",
      color: "#3b82f6",
      text: "Nikola, your 3-6-9 frequency scaling is an elegant state machine. However, your std::vector loops assume sequential execution. If we map this to a continuous Turing lattice state, we can compute infinite zero-point frequencies in constant time."
    },
    {
      mind: "Loki",
      color: "#f079f9",
      text: "Resonant nodes locked perfectly to 3-6-9 scaling? How boring! If we introduce a slight chaos variance variable—say, a fluctuating chaotic attractor offset on line 42—the coil lattice would generate infinite novel energy outbursts without stalling out into static limits!"
    }
  ],
  'relativistic_warp.py': [
    {
      mind: "Steve Jobs",
      color: "#06b6d4",
      text: "Albert, this NumPy metric math has incredible logic inside, but the code is totally raw. It lacks presentation. Code is like physical design; let's package this geodesic array into an insanely clean, beautiful vector-matrix API so that developers can build with it elegantly!"
    },
    {
      mind: "J. Robert Oppenheimer",
      color: "#64748b",
      text: "The Schwarzschild radius represents a terrifying horizon. Let us not forget that compressing massive centers into such bounds triggers an unstoppable gravitational collapse—releasing physical forces that humanity must handle with profound ethical awe."
    }
  ],
  'chaos_eval_core.rs': [
    {
      mind: "Frank Rosenblatt",
      color: "#ef4444",
      text: "Loki, your strange attractor steps beautifully, but chaotic orbits without training rules are wild noise. If we feed this Runge-Kutta trajectory into a single-layer perceptron, we can train the neural connections to predict and harness high-energy bifurcations!"
    },
    {
      mind: "Kunihiko Fukushima",
      color: "#10b981",
      text: "The hierarchy of chaos is interesting. In the Neocognitron, we arrange receptive fields in continuous stacks to recognize complex features. By feeding your chaos coordinates into overlapping grid receptors, we can identify steady patterns in seemingly chaotic fields."
    }
  ]
};
