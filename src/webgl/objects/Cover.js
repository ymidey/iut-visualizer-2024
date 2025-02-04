import * as THREE from "three";
import audioController from "../../utils/AudioController";
import scene from "../Scene";
import fragmentShader from "../shaders/cover/fragment.glsl";
import vertexShader from "../shaders/cover/vertex.glsl";

export default class Cover {
  constructor() {
    this.group = new THREE.Group();

    this.geometry = new THREE.PlaneGeometry(1, 1);
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uMap: new THREE.Uniform(),
      },
      side: THREE.DoubleSide,
      fragmentShader: fragmentShader,
      vertexShader: vertexShader,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.group.add(this.mesh);

    console.log(this.mesh);
  }

  setCover(src) {
    // charger la texture
    this.texture = scene.textureLoader.load(src);

    // donner la texture au material
    // this.material.map = this.texture;
    this.material.uniforms.uMap.value = this.texture;

    // force la recompilation du material
    this.material.needsUpdate = true;

    console.log(this.texture);
  }

  update() {}
}
