
precision mediump float;

attribute vec2 vertPosition;

void main()
{
  gl_Position = vec4(vertPosition * vec2(0.02, -0.02), 0.0, 1.0);
}