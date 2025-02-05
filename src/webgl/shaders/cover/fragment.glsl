uniform sampler2D uMap;
uniform float uTime;

varying vec2 vUv;


void main(){
    vec4 cover = texture2D(uMap, vUv);

    gl_FragColor = vec4(cover.rgb, 1.0);
    // gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}