import * as THREE from "three";
import audioController from "../../utils/AudioController";

export default class Particle {
  constructor() {
    this.group = new THREE.Group();

    this.geometry = new THREE.BufferGeometry();
    this.count = 500;

    const positions = new Float32Array(this.count * 3);
    const velocities = new Float32Array(this.count * 3);
    const sizes = new Float32Array(this.count);

    for (let i = 0; i < this.count; i++) {
      positions[i * 3] = Math.random() * 20 - 10;
      positions[i * 3 + 1] = Math.random() * 20 - 10;
      positions[i * 3 + 2] = Math.random() * 20 - 10;

      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

      sizes[i] = Math.random() * 0.5 + 0.1;
    }

    this.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute("velocity", new THREE.BufferAttribute(velocities, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.3,
      sizeAttenuation: true,
      map: new THREE.TextureLoader().load("../../../public/textures/particle_texture.jpg"),
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });

    this.material = material;
    this.particles = new THREE.Points(this.geometry, material);
    this.group.add(this.particles);

    this.bassThreshold = 200; // seuil de basses pour déclencher une explosion
    this.lastExplosion = 0;
  }

  update(time, deltaTime) {
    const positions = this.geometry.attributes.position.array;
    const velocities = this.geometry.attributes.velocity.array;

    // Analyse des basses
    const bass = audioController.fdata ? audioController.fdata[0] : 0;
    const bpmSpeed = audioController.bpm ? audioController.bpm / 60 : 1;

    for (let i = 0; i < this.count; i++) {
      positions[i * 3] += velocities[i * 3] * bpmSpeed;
      positions[i * 3 + 1] += velocities[i * 3 + 1] * bpmSpeed;
      positions[i * 3 + 2] += velocities[i * 3 + 2] * bpmSpeed;
    }

    // 💥 Si grosse basse, explosion de particules
    if (bass > this.bassThreshold && time - this.lastExplosion > 0.2) {
      this.lastExplosion = time;

      for (let i = 0; i < this.count; i++) {
        // explosion aléatoire
        velocities[i * 3] = (Math.random() - 0.5) * 1;
        velocities[i * 3 + 1] = (Math.random() - 0.5) * 1;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 1;

        // repositionner au centre pour simuler une source de son
        positions[i * 3] = 0;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = 0;
      }

      // flash color
      this.material.color.setHSL(Math.random(), 1, 0.8);
      this.material.size = 1.0;
    } else {
      this.material.size = 0.3 + bass * 0.002;
    }

    this.geometry.attributes.position.needsUpdate = true;
  }
}
