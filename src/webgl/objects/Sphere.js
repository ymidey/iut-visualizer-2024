import * as THREE from 'three';
import audioController from '../../utils/AudioController';

export default class Sphere {
    constructor() {
        this.group = new THREE.Group();

        this.geometry = new THREE.IcosahedronGeometry(4, 64);

        this.uniforms = {
            u_time: { value: 0.0 },
            u_bass: { value: 0.0 },
            u_amplitude: { value: 2.0 },
            u_color: { value: new THREE.Color(0x8f00ff) },
            u_glowIntensity: { value: 0.5 },
            u_particleCount: { value: 1000 },
            u_particleSize: { value: 0.05 }
        };

        this.material = new THREE.ShaderMaterial({
            vertexShader: `
                uniform float u_time;
                uniform float u_bass;
                uniform float u_amplitude;
                varying vec3 vNormal;
                varying vec3 vPosition;

                void main() {
                    vNormal = normal;
                    vPosition = position;
                    float displacement = sin(u_time + position.y * 10.0) * u_bass * u_amplitude;
                    vec3 newPosition = position + normal * displacement;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 u_color;
                uniform float u_glowIntensity;
                varying vec3 vNormal;
                varying vec3 vPosition;

                void main() {
                    float intensity = pow(0.9 - dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 2.0);
                    vec3 glowColor = u_color * intensity * u_glowIntensity;
                    gl_FragColor = vec4(glowColor, 1.0);
                }
            `,
            uniforms: this.uniforms,
            wireframe: true
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.group.add(this.mesh);

        this.particleGeometry = new THREE.BufferGeometry();
        const count = this.uniforms.u_particleCount.value;
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = 6;

            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);

            positions.set([x, y, z], i * 3);
        }

        this.initialPositions = positions.slice();
        this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        this.particleMaterial = new THREE.PointsMaterial({
            color: 0x8f00ff,
            size: this.uniforms.u_particleSize.value,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.particles = new THREE.Points(this.particleGeometry, this.particleMaterial);
        this.group.add(this.particles);
    }

    update(time, deltaTime) {
        const bass = audioController.getBass();
        this.uniforms.u_time.value = time / 1000;
        this.uniforms.u_bass.value = bass;
        this.uniforms.u_glowIntensity.value = Math.max(0.2, Math.min(1.0, bass * 0.5));

        this.particles.rotation.y += 0.0015;

        const base = this.initialPositions;
        const pos = this.particleGeometry.attributes.position.array;

        const amplitude = 0.3 + bass * 0.2;
        const radiusFactor = 1.0 + bass * 0.5;

        for (let i = 0; i < pos.length; i += 3) {
            const x0 = base[i] * radiusFactor;
            const y0 = base[i + 1] * radiusFactor;
            const z0 = base[i + 2] * radiusFactor;

            pos[i] = x0 + Math.sin(time * 0.001 + i) * amplitude;
            pos[i + 1] = y0 + Math.cos(time * 0.001 + i) * amplitude;
            pos[i + 2] = z0 + Math.sin(time * 0.001 + i * 0.3) * amplitude;
        }

        this.particleGeometry.attributes.position.needsUpdate = true;
    }
}
