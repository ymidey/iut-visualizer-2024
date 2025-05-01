import * as THREE from "three";
import audioController from "../../utils/AudioController";

export default class Board {
    constructor() {
        this.height = 16; // number of rows in the triangle
        this.gap = 1;
        this.group = new THREE.Group();
        this.count = 0;
        this.materialCount = 0;

        // cube geometry
        this.geometry = new THREE.BoxGeometry(1, 1, 1);

        this.whiteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.pinkMaterial = new THREE.MeshBasicMaterial({ color: 0x8f00ff });

        // Build a right-angled triangle: each row y has y+1 cubes
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x <= y; x++) {
                // choose material based on checker pattern
                const material = (x % 2 === y % 2) ? this.whiteMaterial : this.pinkMaterial;
                const mesh = new THREE.Mesh(this.geometry, material);

                // center each row horizontally: shift by -(rowWidth - 1)/2
                const rowWidth = y + 1;
                const xOffset = -((rowWidth - 1) / 2);
                mesh.position.set(xOffset + x, -this.height / 2 + y, 0);

                this.group.add(mesh);
            }
        }
    }

    update(time, deltaTime) {
        if (audioController.bpm) {
            this.count += deltaTime * 0.001;
            if (this.count > 60 / audioController.bpm) {
                // swap colors on beat
                if (this.materialCount % 2 === 0) {
                    this.whiteMaterial.color.setHex(0x8f00ff);
                    this.pinkMaterial.color.setHex(0xffffff);
                } else {
                    this.pinkMaterial.color.setHex(0x8f00ff);
                    this.whiteMaterial.color.setHex(0xffffff);
                }
                this.count = 0;
                this.materialCount++;
            }
        }

        // pulse cubes based on frequency data
        this.group.children.forEach((child, i) => {
            child.scale.z = (audioController.fdata[i] || 0) * 0.05;
        });

        // rotate the group slowly
        this.group.rotation.x += 0.001;
        this.group.rotation.y += 0.001;
    }
}
