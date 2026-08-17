import * as twgl from 'twgl.js'
import type { StructureNode } from '../generation/structure'

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
  outColor = vec4(0.85, 0.9, 0.8, 1.0);
}
`

// This module only reads a structure's public shape (from/to/children) --
// it has no idea what a "rule", "seed", or "params" is (principle 2). It
// doesn't care how the tree was produced, only that it's a tree of segments.
function flattenToSegments(node: StructureNode, out: number[] = []): number[] {
  out.push(node.from[0], node.from[1], node.to[0], node.to[1])
  for (const child of node.children) {
    flattenToSegments(child, out)
  }
  return out
}

export interface StructureRenderer {
  render(root: StructureNode): void
}

export function createStructureRenderer(gl: WebGL2RenderingContext): StructureRenderer {
  const programInfo = twgl.createProgramInfo(gl, [vertexShader, fragmentShader])

  return {
    render(root: StructureNode) {
      const segments = flattenToSegments(root)
      const bufferInfo = twgl.createBufferInfoFromArrays(gl, {
        position: { numComponents: 2, data: segments },
      })

      gl.clearColor(0.07, 0.07, 0.07, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.useProgram(programInfo.program)
      twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)
      twgl.drawBufferInfo(gl, bufferInfo, gl.LINES)
    },
  }
}
