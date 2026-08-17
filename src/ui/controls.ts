import { Pane } from 'tweakpane'
import type { GenerationParams } from '../generation/structure'

// Only touches the control panel and the params object -- no imports from
// generation/ or render/ beyond the GenerationParams type. (Workflow
// principle 5: expose parameters that materially affect the form.)
export function createControls(params: GenerationParams, onChange: () => void): Pane {
  const pane = new Pane({ title: 'Parameters' })

  pane.addBinding(params, 'depth', { min: 1, max: 8, step: 1 })
  pane.addBinding(params, 'branchAngle', { min: 0, max: 1.2, step: 0.01 })
  pane.addBinding(params, 'lengthDecay', { min: 0.3, max: 0.95, step: 0.01 })
  pane.addBinding(params, 'angleJitter', { min: 0, max: 0.5, step: 0.01 })

  pane.on('change', onChange)

  return pane
}
