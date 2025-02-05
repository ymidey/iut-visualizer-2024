
#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

uniform float uTime;
uniform float uAudioFrequency;

varying vec2 vUv;

void main(){

    float displacementMax = uAudioFrequency / 255.0; //entre 0 et 1


    vec3 pos = position;
    float noise = snoise3(vec3(pos.x * 0.5, pos.y * 0.5, uTime * 0.1));

    pos.z += noise * displacementMax * 2.0; // Modifier l'axe Z selon le noise


    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
    // gl_PointSize *= 1.0 / - viewPosition.z;
    gl_PointSize = 2.0;

    vUv = uv;
}