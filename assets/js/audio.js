/**
 * PAKKA LOCAL — WEB AUDIO SOUND ENGINE
 * Real-time synthesis for engine idle, acceleration pitch shift, and city ambiance.
 */

class PakkaAudioEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = true;
        this.isInitialized = false;

        // Sound Nodes
        this.masterGain = null;
        this.engineOsc = null;
        this.engineSubOsc = null;
        this.engineGain = null;
        this.engineFilter = null;
        this.noiseNode = null;
        this.noiseGain = null;

        // Current parameters
        this.targetRPM = 800; // idle
        this.currentRPM = 800;
    }

    init() {
        if (this.isInitialized) return;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();

            // Master Gain
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);

            // Engine Low Frequency Rumble (Engine Body)
            this.engineOsc = this.ctx.createOscillator();
            this.engineOsc.type = 'sawtooth';
            this.engineOsc.frequency.setValueAtTime(45, this.ctx.currentTime);

            this.engineSubOsc = this.ctx.createOscillator();
            this.engineSubOsc.type = 'triangle';
            this.engineSubOsc.frequency.setValueAtTime(22.5, this.ctx.currentTime);

            // Engine Filter (Muffled exhaust sound)
            this.engineFilter = this.ctx.createBiquadFilter();
            this.engineFilter.type = 'lowpass';
            this.engineFilter.frequency.setValueAtTime(140, this.ctx.currentTime);
            this.engineFilter.Q.setValueAtTime(3.5, this.ctx.currentTime);

            this.engineGain = this.ctx.createGain();
            this.engineGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

            this.engineOsc.connect(this.engineFilter);
            this.engineSubOsc.connect(this.engineFilter);
            this.engineFilter.connect(this.engineGain);
            this.engineGain.connect(this.masterGain);

            // Start Oscillators
            this.engineOsc.start();
            this.engineSubOsc.start();

            // Ambient Air / Road Friction Noise
            this.initNoiseGenerator();

            this.isInitialized = true;
            this.startAudioLoop();
        } catch (e) {
            console.warn('Web Audio not supported or blocked by browser policy:', e);
        }
    }

    initNoiseGenerator() {
        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(280, this.ctx.currentTime);
        noiseFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

        this.noiseGain = this.ctx.createGain();
        this.noiseGain.gain.setValueAtTime(0.02, this.ctx.currentTime);

        whiteNoise.connect(noiseFilter);
        noiseFilter.connect(this.noiseGain);
        this.noiseGain.connect(this.masterGain);

        whiteNoise.start();
    }

    toggleMute() {
        if (!this.isInitialized) {
            this.init();
        }

        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        this.isMuted = !this.isMuted;

        if (this.masterGain) {
            const targetVol = this.isMuted ? 0 : 0.35;
            this.masterGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.15);
        }

        // Update Header UI
        const btn = document.getElementById('sound-toggle');
        const iconMuted = btn?.querySelector('.icon-muted');
        const iconUnmuted = btn?.querySelector('.icon-unmuted');
        const soundLabel = btn?.querySelector('.sound-label');

        if (btn) {
            if (this.isMuted) {
                iconMuted?.classList.remove('hidden');
                iconUnmuted?.classList.add('hidden');
                btn.classList.remove('active');
                if (soundLabel) soundLabel.textContent = 'SOUND';
            } else {
                iconMuted?.classList.add('hidden');
                iconUnmuted?.classList.remove('hidden');
                btn.classList.add('active');
                if (soundLabel) soundLabel.textContent = 'ON';
                this.playBeep(520, 0.08);
            }
        }

        return !this.isMuted;
    }

    setSpeed(velocity) {
        // velocity is 0..100 km/h
        const clampedSpeed = Math.max(0, Math.min(velocity, 100));
        // Idle = 800 RPM, Max speed = 3600 RPM
        this.targetRPM = 800 + (clampedSpeed / 100) * 2800;
    }

    startAudioLoop() {
        const update = () => {
            if (!this.isMuted && this.ctx && this.engineOsc) {
                // Smooth interpolation for engine revving
                this.currentRPM += (this.targetRPM - this.currentRPM) * 0.1;

                // Base frequency proportional to RPM (e.g. 40Hz to 180Hz)
                const baseFreq = (this.currentRPM / 800) * 45;
                this.engineOsc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
                this.engineSubOsc.frequency.setValueAtTime(baseFreq * 0.5, this.ctx.currentTime);

                // Filter opens up when revving
                const filterFreq = 140 + (this.currentRPM - 800) * 0.35;
                this.engineFilter.frequency.setValueAtTime(filterFreq, this.ctx.currentTime);

                // Wind noise increase with speed
                if (this.noiseGain) {
                    const noiseVol = 0.02 + ((this.currentRPM - 800) / 2800) * 0.08;
                    this.noiseGain.gain.setValueAtTime(noiseVol, this.ctx.currentTime);
                }
            }
            requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    }

    playBeep(freq = 440, duration = 0.1) {
        if (this.isMuted || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {}
    }

    playDistantHorn() {
        if (this.isMuted || !this.ctx) return;
        try {
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc1.frequency.setValueAtTime(390, this.ctx.currentTime); // G4
            osc2.frequency.setValueAtTime(465, this.ctx.currentTime); // Bb4

            gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.45);

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(this.masterGain);

            osc1.start();
            osc2.start();
            osc1.stop(this.ctx.currentTime + 0.45);
            osc2.stop(this.ctx.currentTime + 0.45);
        } catch (e) {}
    }
}

window.pakkaAudio = new PakkaAudioEngine();

document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('sound-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            window.pakkaAudio.toggleMute();
        });
    }
});
