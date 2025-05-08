import gsap from "gsap";
import detect from "bpm-detective";
import useStore from "./store";

class AudioController {
  constructor() {
    this.currentIndex = null;
    this.playlist = [];
    this.shuffle = false;
    this.repeatOne = false;
  }

  setup() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();

    this.audio = new Audio();
    this.audio.crossOrigin = "anonymous";
    this.bpm = null;
    this.audio.volume = 0.1;

    this.audioSource = this.ctx.createMediaElementSource(this.audio);

    this.analyserNode = new AnalyserNode(this.ctx, {
      fftSize: 1024,
      smoothingTimeConstant: 0.8,
    });

    this.fdata = new Uint8Array(this.analyserNode.frequencyBinCount);

    this.audioSource.connect(this.analyserNode);
    this.audioSource.connect(this.ctx.destination);

    gsap.ticker.add(this.tick);

    this.audio.addEventListener("loadeddata", async () => {
      await this.detectBPM();
    });

    this.audio.addEventListener("ended", () => {
      if (this.repeatOne) {
        this.audio.currentTime = 0;
        this.audio.play();
      } else {
        this.playNext();
      }
    });
  }

  detectBPM = async () => {
    try {
      const offlineCtx = new OfflineAudioContext(
        1,
        this.audio.duration * this.ctx.sampleRate,
        this.ctx.sampleRate
      );
      const response = await fetch(this.audio.src);
      const buffer = await response.arrayBuffer();
      const audioBuffer = await offlineCtx.decodeAudioData(buffer);
      this.bpm = detect(audioBuffer);
      console.log(`Detected BPM: ${this.bpm}`);
    } catch (error) {
      console.error("BPM detection failed:", error);
    }
  };

  setShuffleMode = (active) => {
    this.shuffle = active;
  };

  setRepeatOne = (active) => {
    this.repeatOne = active;
  };

  play = (src, index = 0, newPlaylist = null) => {
    if (newPlaylist) {
      this.playlist = newPlaylist;
    }

    this.currentIndex = index;
    const track = this.playlist[index];
    const trackId = track?.id ?? `local-${index}`;

    useStore.getState().setCurrentTrackIndex(index);
    useStore.getState().setCurrentTrackId(trackId);

    this.audio.src = src;
    this.audio.play();
  };

  getBass() {
    this.analyserNode.getByteFrequencyData(this.fdata);
    const bassLevel = this.fdata.slice(0, 10).reduce((sum, value) => sum + value, 0) / 10;
    return bassLevel / 255;
  }

  playPrevious = () => {
    if (!this.playlist || this.playlist.length === 0) return;

    if (this.currentIndex !== null && this.currentIndex > 0) {
      const previousTrack = this.playlist[this.currentIndex - 1];
      this.play(previousTrack.preview, this.currentIndex - 1);
    }
  };

  playNext = () => {
    if (!this.playlist || this.playlist.length === 0) return;

    if (this.currentIndex !== null && this.currentIndex + 1 >= this.playlist.length) {
      this.play(this.playlist[0].preview, 0);
    } else if (this.shuffle) {
      const randomIndex = Math.floor(Math.random() * this.playlist.length);
      this.play(this.playlist[randomIndex].preview, randomIndex);
    } else if (this.currentIndex !== null && this.currentIndex + 1 < this.playlist.length) {
      const nextTrack = this.playlist[this.currentIndex + 1];
      this.play(nextTrack.preview, this.currentIndex + 1);
    }
  };

  setVolume(volume) {
    if (this.audio) {
      this.audio.volume = volume;
    }
  }

  tick = () => {
    this.analyserNode.getByteFrequencyData(this.fdata);
  };
}

const audioController = new AudioController();
export default audioController;
