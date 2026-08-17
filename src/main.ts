import { getWebGL2Context } from './render/context'
import { createStructureRenderer } from './render/structureRenderer'
import { generateStructure } from './generation/structure'

const canvas = document.querySelector<HTMLCanvasElement>('#canvas')!

function resize() {
  canvas.width = canvas.clientWidth * devicePixelRatio
  canvas.height = canvas.clientHeight * devicePixelRatio
}
resize()
window.addEventListener('resize', resize)

const gl = getWebGL2Context(canvas)
const renderer = createStructureRenderer(gl)
renderer.render(generateStructure(42))
