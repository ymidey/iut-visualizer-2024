import * as THREE from "three";
import gsap from "gsap";

class Scene {
  constructor() {}

  setup(canvas) {
    this.canvas = canvas;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // instantier la logique three.js
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();

    this.addEvents();
    this.addObjects();
  }

  addObjects() {
    this.geometry = new THREE.BoxGeometry(1, 1, 1);
    this.material = new THREE.MeshNormalMaterial();
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.scene.add(this.mesh);
  }

  onResize = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
  };

  addEvents() {
    gsap.ticker.add(this.tick);
    window.addEventListener("resize", this.onResize);
  }

  setupScene() {
    this.scene = new THREE.Scene();
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.width / this.height,
      0.1,
      1000
    );

    this.camera.position.z = 5;
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
    });

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  tick = (time, deltaTime, frame) => {
    this.renderer.render(this.scene, this.camera);
  };
}

const scene = new Scene();
export default scene;
