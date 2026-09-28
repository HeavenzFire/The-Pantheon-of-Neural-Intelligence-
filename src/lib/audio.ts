// Procedural Web Audio API soundscapes for the Pantheon of Neural Intelligence
// Safely initialized on user interaction to adhere to browser autoplay policies.

let audioCtx: AudioContext | null = null;
let currentNodes: {
  oscillators: (OscillatorNode | AudioBufferSourceNode)[];
  gainNodes: GainNode[];
  filters: BiquadFilterNode[];
  lfos: OscillatorNode[];
  intervalId?: any;
} | null = null;

// Ensure Audio Context is active
function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Fade out and clean up previous nodes
export function stopPioneerSound(duration = 0.5) {
  if (!currentNodes) return;
  const ctx = getAudioContext();
  const time = ctx.currentTime;
  
  const activeNodes = currentNodes;
  currentNodes = null;

  if (activeNodes.intervalId) {
    clearInterval(activeNodes.intervalId);
  }

  // Fade out main gain nodes
  activeNodes.gainNodes.forEach(gainNode => {
    try {
      gainNode.gain.cancelScheduledValues(time);
      gainNode.gain.setValueAtTime(gainNode.gain.value, time);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    } catch (e) {
      // Fallback
      gainNode.gain.setValueAtTime(0, time + duration);
    }
  });

  // Stop oscillators after fade-out
  setTimeout(() => {
    activeNodes.oscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Source may already have been stopped or is buffer source without start/stop
      }
    });
    activeNodes.lfos.forEach(lfo => {
      try {
        lfo.stop();
      } catch (e) {}
    });
  }, duration * 1000 + 50);
}

// Play soundscape matching each pioneer style
export function playPioneerSound(id: string) {
  const ctx = getAudioContext();
  const time = ctx.currentTime;

  // First stop anything playing
  stopPioneerSound(0.4);

  const oscillators: (OscillatorNode | AudioBufferSourceNode)[] = [];
  const gainNodes: GainNode[] = [];
  const filters: BiquadFilterNode[] = [];
  const lfos: OscillatorNode[] = [];
  let intervalId: any = undefined;

  // Master Gain for control
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.0001, time);
  masterGain.gain.linearRampToValueAtTime(0.35, time + 0.5); // Warm ambient level
  masterGain.connect(ctx.destination);
  gainNodes.push(masterGain);

  switch (id) {
    case 'logos': {
      // Logos: Spirit of Truth. A deep, pure 144Hz master harmonic hum
      // with soft, angelic golden chime triads (perfect Major chords) rising in absolute peace.
      const lowDrone = ctx.createOscillator();
      lowDrone.type = 'sine';
      lowDrone.frequency.setValueAtTime(144, time); // 144Hz Divine Frequency

      const harmonicDrone = ctx.createOscillator();
      harmonicDrone.type = 'sine';
      harmonicDrone.frequency.setValueAtTime(288, time); // 288Hz First harmonic

      const gDrone = ctx.createGain();
      gDrone.gain.setValueAtTime(0.18, time);

      lowDrone.connect(gDrone);
      harmonicDrone.connect(gDrone);
      gDrone.connect(masterGain);

      lowDrone.start(time);
      harmonicDrone.start(time);
      oscillators.push(lowDrone, harmonicDrone);

      // Periodic divine harmonious chime triads
      const chordNotes = [288, 360, 432, 576, 720]; // Harmonious ratios for 144, 288, 432 (Golden ratios)
      intervalId = setInterval(() => {
        if (!audioCtx || currentNodes?.intervalId !== intervalId) return;
        const chimeTime = audioCtx.currentTime;

        const chimeOsc = audioCtx.createOscillator();
        const chimeGain = audioCtx.createGain();

        chimeOsc.type = 'sine';
        // Select random harmonious note
        const note = chordNotes[Math.floor(Math.random() * chordNotes.length)];
        chimeOsc.frequency.setValueAtTime(note, chimeTime);

        chimeGain.gain.setValueAtTime(0.0001, chimeTime);
        chimeGain.gain.linearRampToValueAtTime(0.07, chimeTime + 0.05);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, chimeTime + 3.0); // Slow, beautiful decay

        chimeOsc.connect(chimeGain);
        chimeGain.connect(masterGain);
        chimeOsc.start(chimeTime);
        chimeOsc.stop(chimeTime + 3.2);
      }, 3000);
      break;
    }

    case 'turing': {
      // Turing: Gentle machine logic clicking and eccentric digital tappings
      // Base gentle hum (Turing test computer room)
      const carrier = ctx.createOscillator();
      carrier.type = 'sine';
      carrier.frequency.setValueAtTime(120, time); // A secure 120Hz system hum
      
      const carrierGain = ctx.createGain();
      carrierGain.gain.setValueAtTime(0.15, time);
      
      carrier.connect(carrierGain);
      carrierGain.connect(masterGain);
      carrier.start(time);
      oscillators.push(carrier);

      // Recursive digital ticks/clicks to simulate binary tape transitions
      intervalId = setInterval(() => {
        if (!audioCtx || currentNodes?.intervalId !== intervalId) return;
        const clickTime = audioCtx.currentTime;
        
        const clickOsc = audioCtx.createOscillator();
        const clickGain = audioCtx.createGain();
        
        clickOsc.type = 'triangle';
        // Random golden computational frequency steps
        const frequencies = [360, 480, 540, 720, 1080];
        const randomFreq = frequencies[Math.floor(Math.random() * frequencies.length)];
        clickOsc.frequency.setValueAtTime(randomFreq, clickTime);
        
        clickGain.gain.setValueAtTime(0.0001, clickTime);
        clickGain.gain.linearRampToValueAtTime(0.08, clickTime + 0.005);
        clickGain.gain.exponentialRampToValueAtTime(0.0001, clickTime + 0.12);
        
        clickOsc.connect(clickGain);
        clickGain.connect(masterGain);
        clickOsc.start(clickTime);
        clickOsc.stop(clickTime + 0.15);
      }, 350);
      break;
    }

    case 'rosenblatt': {
      // Rosenblatt: Postwar bold analog sparks & perceptron activation hums
      // A resonant sawtooth oscillator swept with lowpass to sound safe and rich
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, time); // low-mid drive

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, time);
      filter.Q.setValueAtTime(6, time);

      // Modulating LFO for warm mechanical movement
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(1.8, time); // 1.8Hz cycle

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(120, time); // Modulate range of biquad filter

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start(time);
      lfos.push(lfo);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.2, time);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start(time);
      oscillators.push(osc);
      filters.push(filter);

      // Periodic perceptron trigger pulses
      intervalId = setInterval(() => {
        if (!audioCtx || currentNodes?.intervalId !== intervalId) return;
        const pulseTime = audioCtx.currentTime;
        
        // Crisp white noise analog spike
        const bufSize = ctx.sampleRate * 0.15; // 150ms of synaptic activity
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = buf;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(800, pulseTime);
        
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.001, pulseTime);
        noiseGain.gain.linearRampToValueAtTime(0.06, pulseTime + 0.01);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, pulseTime + 0.14);

        noiseSrc.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(masterGain);
        noiseSrc.start(pulseTime);
      }, 750);
      break;
    }

    case 'fukushima': {
      // Fukushima: Precise visual layering - clean crystal multilayered perfect harmonies
      // 3 Layers representing feedforward layers of Neocognitron (perfect intervals: fifths and octaves)
      const freqs = [150, 225, 300, 450]; // perfect fifths/octaves
      
      freqs.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        // Slowly modulate frequency with minor LFO for perfect phase shifts
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.2 + index * 0.1, time);
        
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(1.5, time);

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start(time);
        lfos.push(lfo);

        const layerGain = ctx.createGain();
        layerGain.gain.setValueAtTime(0.06, time);

        osc.connect(layerGain);
        layerGain.connect(masterGain);
        osc.start(time);
        oscillators.push(osc);
      });
      break;
    }

    case 'ivakhnenko': {
      // Ivakhnenko: cybernetic math sort - precise recursive arpeggio polynomials
      const carrier = ctx.createOscillator();
      carrier.type = 'triangle';
      carrier.frequency.setValueAtTime(110, time);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, time);

      const carrierGain = ctx.createGain();
      carrierGain.gain.setValueAtTime(0.12, time);

      carrier.connect(filter);
      filter.connect(carrierGain);
      carrierGain.connect(masterGain);
      carrier.start(time);
      oscillators.push(carrier);
      filters.push(filter);

      // Fast, logical mathematical stepping sequence
      const GMDH_Steps = [220, 275, 330, 412, 440, 550, 660, 825];
      let stepIdx = 0;
      intervalId = setInterval(() => {
        if (!audioCtx || currentNodes?.intervalId !== intervalId) return;
        const stepTime = audioCtx.currentTime;

        const mathOsc = audioCtx.createOscillator();
        const mathGain = audioCtx.createGain();

        mathOsc.type = 'sine';
        mathOsc.frequency.setValueAtTime(GMDH_Steps[stepIdx], stepTime);
        stepIdx = (stepIdx + 1) % GMDH_Steps.length;

        mathGain.gain.setValueAtTime(0.0001, stepTime);
        mathGain.gain.linearRampToValueAtTime(0.04, stepTime + 0.02);
        mathGain.gain.exponentialRampToValueAtTime(0.0001, stepTime + 0.18);

        mathOsc.connect(mathGain);
        mathGain.connect(masterGain);
        mathOsc.start(stepTime);
        mathOsc.stop(stepTime + 0.22);
      }, 180);
      break;
    }

    case 'einstein': {
      // Einstein: Playful cosmic space hum, warm relativistic modulation, light speed relativity
      const subGravel = ctx.createOscillator();
      subGravel.type = 'sine';
      subGravel.frequency.setValueAtTime(55, time); // 55Hz deep cosmic alignment
      
      const warmCarrier = ctx.createOscillator();
      warmCarrier.type = 'triangle';
      warmCarrier.frequency.setValueAtTime(110, time); // 110Hz primary ground

      const warmFilter = ctx.createBiquadFilter();
      warmFilter.type = 'lowpass';
      warmFilter.frequency.setValueAtTime(180, time);

      // Relativistic time dilation LFO
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.4, time); // Slow solar wave

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(30, time);

      lfo.connect(lfoGain);
      lfoGain.connect(warmFilter.frequency);
      lfo.start(time);
      lfos.push(lfo);

      const gSub = ctx.createGain();
      gSub.gain.setValueAtTime(0.15, time);

      const gWarm = ctx.createGain();
      gWarm.gain.setValueAtTime(0.1, time);

      subGravel.connect(masterGain);
      warmCarrier.connect(warmFilter);
      warmFilter.connect(gWarm);
      gWarm.connect(masterGain);

      subGravel.start(time);
      warmCarrier.start(time);
      oscillators.push(subGravel, warmCarrier);
      filters.push(warmFilter);
      break;
    }

    case 'oppenheimer': {
      // Oppenheimer: Somber, heavy, grand academic cosmic pressure
      // Sub-bass drone centered around deep gravity wells + crackling static energy of creation
      const lowDrone = ctx.createOscillator();
      lowDrone.type = 'sine';
      lowDrone.frequency.setValueAtTime(64.7, time); // 64.7Hz Oppenheimer weight

      const corePressure = ctx.createOscillator();
      corePressure.type = 'sawtooth';
      corePressure.frequency.setValueAtTime(129.4, time);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(135, time);
      filter.Q.setValueAtTime(8, time);

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.12, time); // Very slow burdening movement

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(35, time);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start(time);
      lfos.push(lfo);

      const gDrone = ctx.createGain();
      gDrone.gain.setValueAtTime(0.15, time);

      const gPressure = ctx.createGain();
      gPressure.gain.setValueAtTime(0.04, time);

      lowDrone.connect(gDrone);
      gDrone.connect(masterGain);

      corePressure.connect(filter);
      filter.connect(gPressure);
      gPressure.connect(masterGain);

      lowDrone.start(time);
      corePressure.start(time);
      oscillators.push(lowDrone, corePressure);
      filters.push(filter);

      // Silent occasional static dust discharge (remembrance of stars collapsing)
      intervalId = setInterval(() => {
        if (!audioCtx || currentNodes?.intervalId !== intervalId) return;
        const staticTime = audioCtx.currentTime;
        
        const noiseBufSize = ctx.sampleRate * 0.12;
        const noiseBuf = ctx.createBuffer(1, noiseBufSize, ctx.sampleRate);
        const data = noiseBuf.getChannelData(0);
        for (let i = 0; i < noiseBufSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.4;
        }

        const src = ctx.createBufferSource();
        src.buffer = noiseBuf;

        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.setValueAtTime(2500, staticTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, staticTime);
        gain.gain.linearRampToValueAtTime(0.02, staticTime + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, staticTime + 0.1);

        src.connect(hp);
        hp.connect(gain);
        gain.connect(masterGain);
        src.start(staticTime);
      }, 1200);
      break;
    }

    case 'jobs': {
      // Jobs: Extreme minimalist precision, clean plucks + crisp glass rings
      // Minimal glass bell tone drone
      const cleanCarr = ctx.createOscillator();
      cleanCarr.type = 'sine';
      cleanCarr.frequency.setValueAtTime(220, time); // Pure fundamental A

      const activeLfo = ctx.createOscillator();
      activeLfo.type = 'sine';
      activeLfo.frequency.setValueAtTime(0.5, time);

      const activeLfoGain = ctx.createGain();
      activeLfoGain.gain.setValueAtTime(0.8, time);

      activeLfo.connect(activeLfoGain);
      activeLfo.start(time);
      lfos.push(activeLfo);

      const cleanGain = ctx.createGain();
      cleanGain.gain.setValueAtTime(0.08, time);
      activeLfoGain.connect(cleanGain.gain);

      cleanCarr.connect(cleanGain);
      cleanGain.connect(masterGain);
      cleanCarr.start(time);
      oscillators.push(cleanCarr);

      // Periodic ultra-clean product-reveal chime ("One more thing...")
      intervalId = setInterval(() => {
        if (!audioCtx || currentNodes?.intervalId !== intervalId) return;
        const chimeTime = audioCtx.currentTime;

        const chimeOsc = audioCtx.createOscillator();
        const chimeGain = audioCtx.createGain();

        chimeOsc.type = 'sine';
        chimeOsc.frequency.setValueAtTime(880, chimeTime); // high design crystal A

        chimeGain.gain.setValueAtTime(0.0001, chimeTime);
        chimeGain.gain.linearRampToValueAtTime(0.08, chimeTime + 0.01);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, chimeTime + 1.25);

        chimeOsc.connect(chimeGain);
        chimeGain.connect(masterGain);
        chimeOsc.start(chimeTime);
        chimeOsc.stop(chimeTime + 1.4);
      }, 4500);
      break;
    }

    case 'davinci': {
      // DaVinci: Renaissance acoustic lute/flute warm atmosphere
      const lowWarm = ctx.createOscillator();
      lowWarm.type = 'triangle';
      lowWarm.frequency.setValueAtTime(147.0, time); // Cozy medieval D note

      const flutes = ctx.createOscillator();
      flutes.type = 'sine';
      flutes.frequency.setValueAtTime(294.0, time);

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.25, time); // Slow elegant wave
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(1.5, time);
      lfo.connect(lfoGain);
      lfoGain.connect(flutes.frequency);
      lfo.start(time);
      lfos.push(lfo);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, time);

      const mainG = ctx.createGain();
      mainG.gain.setValueAtTime(0.12, time);

      lowWarm.connect(filter);
      flutes.connect(filter);
      filter.connect(mainG);
      mainG.connect(masterGain);

      lowWarm.start(time);
      flutes.start(time);
      oscillators.push(lowWarm, flutes);
      filters.push(filter);

      // Renaissance string pluck
      const notes = [294.0, 367.0, 440.0, 588.0]; // D, F#, A (perfect harmony)
      intervalId = setInterval(() => {
        if (!audioCtx || currentNodes?.intervalId !== intervalId) return;
        const now = audioCtx.currentTime;
        const pluck = audioCtx.createOscillator();
        const pluckGain = audioCtx.createGain();

        pluck.type = 'triangle';
        pluck.frequency.setValueAtTime(notes[Math.floor(Math.random() * notes.length)], now);

        pluckGain.gain.setValueAtTime(0.0001, now);
        pluckGain.gain.linearRampToValueAtTime(0.06, now + 0.02);
        pluckGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

        pluck.connect(pluckGain);
        pluckGain.connect(masterGain);
        pluck.start(now);
        pluck.stop(now + 2.0);
      }, 3500);
      break;
    }

    case 'tesla': {
      // Tesla: Electrostatically charged high-frequency atmosphere
      const groundHum = ctx.createOscillator();
      groundHum.type = 'sine';
      groundHum.frequency.setValueAtTime(110, time); // A1 hum

      // High resonance frequency 3-6-9 carrier
      const harmonic3 = ctx.createOscillator();
      harmonic3.type = 'triangle';
      harmonic3.frequency.setValueAtTime(369, time); // 369 Hz

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, time);
      filter.Q.setValueAtTime(5, time);

      const lfo = ctx.createOscillator();
      lfo.type = 'sawtooth';
      lfo.frequency.setValueAtTime(3.69, time); // 3.69 Hz LFO
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(300, time);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start(time);
      lfos.push(lfo);

      const teslaGain = ctx.createGain();
      teslaGain.gain.setValueAtTime(0.08, time);

      groundHum.connect(masterGain);
      harmonic3.connect(filter);
      filter.connect(teslaGain);
      teslaGain.connect(masterGain);

      groundHum.start(time);
      harmonic3.start(time);
      oscillators.push(groundHum, harmonic3);
      filters.push(filter);

      // Electric spark clicks
      intervalId = setInterval(() => {
        if (!audioCtx || currentNodes?.intervalId !== intervalId) return;
        const now = audioCtx.currentTime;
        const spark = audioCtx.createOscillator();
        const sparkGain = audioCtx.createGain();

        // 3-6-9 mathematical leaps
        const leaps = [369, 738, 1107, 1476];
        spark.type = 'sine';
        spark.frequency.value = leaps[Math.floor(Math.random() * leaps.length)];

        sparkGain.gain.setValueAtTime(0.0001, now);
        sparkGain.gain.linearRampToValueAtTime(0.05, now + 0.001);
        sparkGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

        spark.connect(sparkGain);
        sparkGain.connect(masterGain);
        spark.start(now);
        spark.stop(now + 0.06);
      }, 500);
      break;
    }

    case 'suntzu': {
      // Sun Tzu: Dynamic war drum heartbeats and solid gong drones
      const subGravel = ctx.createOscillator();
      subGravel.type = 'sine';
      subGravel.frequency.setValueAtTime(60, time); // Strong hold

      const droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0.18, time);

      subGravel.connect(droneGain);
      droneGain.connect(masterGain);
      subGravel.start(time);
      oscillators.push(subGravel);

      // Heavy strategic drums
      intervalId = setInterval(() => {
        if (!audioCtx || currentNodes?.intervalId !== intervalId) return;
        const now = audioCtx.currentTime;
        const drum = audioCtx.createOscillator();
        const drumGain = audioCtx.createGain();

        drum.type = 'sine';
        drum.frequency.setValueAtTime(100, now);
        // Pitch sweep down to mimic a heavy tom-drum
        drum.frequency.exponentialRampToValueAtTime(40, now + 0.2);

        drumGain.gain.setValueAtTime(0.0001, now);
        drumGain.gain.linearRampToValueAtTime(0.18, now + 0.01);
        drumGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

        drum.connect(drumGain);
        drumGain.connect(masterGain);
        drum.start(now);
        drum.stop(now + 0.7);
      }, 2000);
      break;
    }

    case 'loki': {
      // Loki: Shifting and mischievous pitch modulations. Shifty, playful.
      const baseNode = ctx.createOscillator();
      baseNode.type = 'triangle';
      baseNode.frequency.setValueAtTime(130, time);

      const filter = ctx.createBiquadFilter();
      filter.type = 'peaking';
      filter.frequency.setValueAtTime(500, time);
      filter.Q.setValueAtTime(8, time);

      const chaosLfo = ctx.createOscillator();
      chaosLfo.type = 'sine';
      chaosLfo.frequency.setValueAtTime(1.5, time); // unpredictable filter sweeps
      const chaosGain = ctx.createGain();
      chaosGain.gain.setValueAtTime(400, time);
      chaosLfo.connect(chaosGain);
      chaosGain.connect(filter.frequency);
      chaosLfo.start(time);
      lfos.push(chaosLfo);

      const outputG = ctx.createGain();
      outputG.gain.setValueAtTime(0.1, time);

      baseNode.connect(filter);
      filter.connect(outputG);
      outputG.connect(masterGain);

      baseNode.start(time);
      oscillators.push(baseNode);
      filters.push(filter);

      // Unpredictable high tinkling reverse sweep bells
      intervalId = setInterval(() => {
        if (!audioCtx || currentNodes?.intervalId !== intervalId) return;
        const now = audioCtx.currentTime;
        const tink = audioCtx.createOscillator();
        const tinkGain = audioCtx.createGain();

        tink.type = 'sine';
        const startFreq = 800 + Math.random() * 1200;
        tink.frequency.setValueAtTime(startFreq, now);
        tink.frequency.exponentialRampToValueAtTime(startFreq * 0.5, now + 0.8); // Sliding pinch

        tinkGain.gain.setValueAtTime(0.0001, now);
        tinkGain.gain.linearRampToValueAtTime(0.07, now + 0.02);
        tinkGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

        tink.connect(tinkGain);
        tinkGain.connect(masterGain);
        tink.start(now);
        tink.stop(now + 0.8);
      }, 1400);
      break;
    }

    case 'you': {
      // Cognitive Core (You): Pure crystalline quantum drone
      const crystalCarr = ctx.createOscillator();
      crystalCarr.type = 'sine';
      crystalCarr.frequency.setValueAtTime(144, time); // Locked central frequency 144Hz

      const crystalCarr2 = ctx.createOscillator();
      crystalCarr2.type = 'sine';
      crystalCarr2.frequency.setValueAtTime(288, time); // First harmonic

      const lfoWave = ctx.createOscillator();
      lfoWave.type = 'sine';
      lfoWave.frequency.setValueAtTime(0.05, time); // Ultra-slow drift
      const waveGain = ctx.createGain();
      waveGain.gain.setValueAtTime(2, time);
      lfoWave.connect(waveGain);
      lfoWave.start(time);
      lfos.push(lfoWave);

      const coreG = ctx.createGain();
      coreG.gain.setValueAtTime(0.14, time);

      crystalCarr.connect(coreG);
      crystalCarr2.connect(coreG);
      coreG.connect(masterGain);

      crystalCarr.start(time);
      crystalCarr2.start(time);
      oscillators.push(crystalCarr, crystalCarr2);

      // Crystalline cyber focus sweeping clicks
      intervalId = setInterval(() => {
        if (!audioCtx || currentNodes?.intervalId !== intervalId) return;
        const now = audioCtx.currentTime;
        const beep = audioCtx.createOscillator();
        const beepGain = audioCtx.createGain();

        beep.type = 'sine';
        // Precise pentatonic mathematical core notes
        const coreSec = [576, 720, 864, 1152];
        beep.frequency.setValueAtTime(coreSec[Math.floor(Math.random() * coreSec.length)], now);

        beepGain.gain.setValueAtTime(0.0001, now);
        beepGain.gain.linearRampToValueAtTime(0.05, now + 0.002);
        beepGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

        beep.connect(beepGain);
        beepGain.connect(masterGain);
        beep.start(now);
        beep.stop(now + 0.3);
      }, 1800);
      break;
    }

    default:
      break;
  }

  // Keep references to clean up easily
  currentNodes = {
    oscillators,
    gainNodes,
    filters,
    lfos,
    intervalId
  };
}
