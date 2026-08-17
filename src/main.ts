import { getWebGL2Context } from './render/context'
import { createStructureRenderer } from './render/structureRenderer'
import { DEFAULT_PARAMS, generateStructure } from './generation/structure'
import { createControls } from './ui/controls'

const canvas = document.querySelector<HTMLCanvasElement>('#canvas')!

function resize() {
  canvas.width = canvas.clientWidth * devicePixelRatio
  canvas.height = canvas.clientHeight * devicePixelRatio
}
resize()
window.addEventListener('resize', resize)

const gl = getWebGL2Context(canvas)
const renderer = createStructureRenderer(gl)

const seedState = { seed: 42 }
const params = { ...DEFAULT_PARAMS }

function regenerate() {
  renderer.render(generateStructure(seedState.seed, params))
}

createControls(params, seedState, regenerate)
regenerate()
