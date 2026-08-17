import { getWebGL2Context } from './render/context'
import { runSmokeTest } from './render/smoke-test'

const canvas = document.querySelector<HTMLCanvasElement>('#canvas')!

function resize() {
  canvas.width = canvas.clientWidth * devicePixelRatio
  canvas.height = canvas.clientHeight * devicePixelRatio
}
resize()
window.addEventListener('resize', resize)

const gl = getWebGL2Context(canvas)
runSmokeTest(gl)
