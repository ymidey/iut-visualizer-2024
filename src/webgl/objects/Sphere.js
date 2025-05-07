import * as THREE from 'three';
import audioController from '../../utils/AudioController';

export default class Sphere {
    constructor() {
        this.group = new THREE.Group();

        this.geometry = new THREE.IcosahedronGeometry(4, 30);

        this.uniforms = {
            u_time: { value: 0.0 },
            u_bass: { value: 0.0 },
            u_amplitude: { value: 1.0 },
        };

        this.material = new THREE.ShaderMaterial({
            vertexShader: `
        uniform float u_time;
        uniform float u_bass;
        uniform float u_amplitude;
        varying vec3 vNormal;

        void main() {
          vNormal = normal;
          float displacement = sin(u_time + position.y * 10.0) * u_bass * u_amplitude;
          vec3 newPosition = position + normal * displacement;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
            fragmentShader: `
        varying vec3 vNormal;

        void main() {
          float intensity = pow(0.9 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(0.8, 0.2, 1.0, 1.0) * intensity;
        }
      `,
            uniforms: this.uniforms,
            wireframe: true,
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.group.add(this.mesh);
    }

    update(time, deltaTime) {
        this.uniforms.u_time.value = time / 1000;
        this.uniforms.u_bass.value = audioController.getBass();
        this.uniforms.u_amplitude.value = 2.0;
    }
}
