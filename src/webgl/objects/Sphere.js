import * as THREE from 'three';
import audioController from '../../utils/AudioController';

export default class Sphere {
    constructor() {
        this.group = new THREE.Group();

        // Création de la géométrie de la sphère avec une subdivision élevée
        this.geometry = new THREE.IcosahedronGeometry(4, 64);

        // Définition des uniformes pour le shader
        this.uniforms = {
            u_time: { value: 0.0 },
            u_bass: { value: 0.0 },
            u_amplitude: { value: 2.0 },
            u_color: { value: new THREE.Color(0x8f00ff) },
            u_glowIntensity: { value: 0.5 },
            u_particleCount: { value: 1000 },
            u_particleSize: { value: 0.05 }
        };

        // Création du matériau avec des shaders personnalisés
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

        // Création du maillage et ajout au groupe
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.group.add(this.mesh);

        // Ajout d'un effet de glow avec une sphère secondaire
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x8f00ff,
            transparent: true,
            opacity: 0.1,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide
        });
        const glowMesh = new THREE.Mesh(this.geometry.clone(), glowMaterial);
        glowMesh.scale.multiplyScalar(1.2);
        this.group.add(glowMesh);

        // Création des particules
        this.particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.uniforms.u_particleCount.value * 3);
        for (let i = 0; i < this.uniforms.u_particleCount.value; i++) {
            positions.set([Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5], i * 3);
        }
        this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.particleMaterial = new THREE.PointsMaterial({
            color: 0x8f00ff,
            size: this.uniforms.u_particleSize.value,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        this.particles = new THREE.Points(this.particleGeometry, this.particleMaterial);
        this.group.add(this.particles);
    }

    update(time, deltaTime) {
        // Mise à jour des uniformes pour animer la sphère
        this.uniforms.u_time.value = time / 1000;
        this.uniforms.u_bass.value = audioController.getBass();

        // Mise à jour de l'intensité du glow en fonction des basses
        this.uniforms.u_glowIntensity.value = Math.min(1.0, audioController.getBass() * 0.5);

        // Mise à jour des particules pour simuler l'effet magique
        const positions = this.particleGeometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += Math.sin(time * 0.001 + i) * 0.01;
            positions[i + 1] += Math.cos(time * 0.001 + i) * 0.01;
            positions[i + 2] += Math.sin(time * 0.001 + i) * 0.01;
        }
        this.particleGeometry.attributes.position.needsUpdate = true;
    }
}
