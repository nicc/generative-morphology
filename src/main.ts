const canvas = document.querySelector<HTMLCanvasElement>('#canvas')!

function resize() {
  canvas.width = canvas.clientWidth * devicePixelRatio
  canvas.height = canvas.clientHeight * devicePixelRatio
}
resize()
window.addEventListener('resize', resize)
