
precision mediump float;

attribute vec2 vertPosition;

void main()
{
  gl_Position = vec4(vertPosition * 0.015, 0.0, 1.0);
}