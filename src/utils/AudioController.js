import gsap from "gsap";
import detect from "bpm-detective";
import useStore from "./store";


class AudioController {
  constructor() {
    this.currentIndex = null;
    this.playlist = [];
    this.shuffle = false; // ← mode aléatoire désactivé par défaut
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
      this.playNext();
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

  /**
   * Définit le mode de lecture aléatoire
   */
  setShuffleMode = (active) => {
    this.shuffle = active;
  };

  /**
   * Joue une piste spécifique
   * @param {string} src - URL de la piste
   * @param {number} index - index dans la playlist
   * @param {Array} newPlaylist - playlist complète
   */
  play = (src, index = 0, newPlaylist = null) => {
    if (newPlaylist) {
      this.playlist = newPlaylist;
    }

    this.currentIndex = index;
    useStore.getState().setCurrentTrackIndex(index); // 👈 notifier l'état global

    this.audio.src = src;
    this.audio.play();
  };

  playPrevious = () => {
    if (!this.playlist || this.playlist.length === 0) return;

    if (this.currentIndex !== null && this.currentIndex > 0) {
      const previousTrack = this.playlist[this.currentIndex - 1];
      this.play(previousTrack.preview, this.currentIndex - 1);
    }
  };


  play = (src, index = 0, newPlaylist = null) => {
    if (newPlaylist) {
      this.playlist = newPlaylist;
    }

    this.currentIndex = index;

    const setCurrentTrackIndex = useStore.getState().setCurrentTrackIndex;
    setCurrentTrackIndex(index); // ← met à jour l'état global

    this.audio.src = src;
    this.audio.play();
  };


  /**
   * Joue la prochaine piste en fonction du mode
   */
  playNext = () => {
    if (!this.playlist || this.playlist.length === 0) return;

    if (this.shuffle) {
      const randomIndex = Math.floor(Math.random() * this.playlist.length);
      const nextTrack = this.playlist[randomIndex];
      this.play(nextTrack.preview, randomIndex);
    } else if (
      this.currentIndex !== null &&
      this.currentIndex + 1 < this.playlist.length
    ) {
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
