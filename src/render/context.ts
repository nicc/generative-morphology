export function getWebGL2Context(canvas: HTMLCanvasElement): WebGL2RenderingContext {
  const gl = canvas.getContext('webgl2')
  if (!gl) {
    throw new Error('WebGL2 is not available in this browser.')
  }
  return gl
}
