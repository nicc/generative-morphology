import * as twgl from 'twgl.js'

const vertexShader = /* glsl */ `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragmentShader = /* glsl */ `#version 300 es
precision highp float;
out vec4 outColor;
void main() {
  outColor = vec4(0.9, 0.4, 0.2, 1.0);
}
`

// Proves the WebGL2 + twgl draw path end to end: compile, bind, draw one
// triangle. Not part of the generation pipeline -- this file goes away once
// the real renderer (structure -> draw calls) exists.
export function runSmokeTest(gl: WebGL2RenderingContext): void {
  const programInfo = twgl.createProgramInfo(gl, [vertexShader, fragmentShader])

  const bufferInfo = twgl.createBufferInfoFromArrays(gl, {
    position: { numComponents: 2, data: [0, 0.6, -0.6, -0.5, 0.6, -0.5] },
  })

  gl.clearColor(0.07, 0.07, 0.07, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)

  gl.useProgram(programInfo.program)
  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)
  twgl.drawBufferInfo(gl, bufferInfo)
}
