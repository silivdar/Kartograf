
precision mediump float;

uniform vec3 featureColor;

void main()
{
  gl_FragColor = vec4(featureColor, 1.0);
}