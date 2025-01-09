import * as THREE from "three";
import audioController from "../../utils/AudioController";

export default class Board {
  constructor() {
    this.width = 16;
    this.gap = 1;
    this.group = new THREE.Group();

    this.geometry = new THREE.BoxGeometry(1, 1, 1);

    this.whiteMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });

    this.pinkMaterial = new THREE.MeshBasicMaterial({
      color: 0x8f00ff,
    });

    for (let y = 0; y < this.width; y++) {
      for (let x = 0; x < this.width; x++) {
        let mesh;

        if (x % 2 === y % 2) {
          mesh = new THREE.Mesh(this.geometry, this.whiteMaterial);
        } else {
          mesh = new THREE.Mesh(this.geometry, this.pinkMaterial);
        }

        mesh.position.set(x, y, 0);

        this.group.add(mesh);
      }
    }

    this.group.position.x = -this.width / 2;
    this.group.position.y = -this.width / 2;
  }
}
