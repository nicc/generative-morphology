import { Pane } from 'tweakpane'
import type { GenerationParams } from '../generation/structure'
import { deriveSeed, mulberry32 } from '../generation/rng'

type ParamKey = keyof GenerationParams

const PARAM_RANGES: Record<ParamKey, { min: number; max: number; step: number }> = {
  depth: { min: 1, max: 8, step: 1 },
  branchAngle: { min: 0, max: 1.2, step: 0.01 },
  lengthDecay: { min: 0.3, max: 0.95, step: 0.01 },
  angleJitter: { min: 0, max: 0.5, step: 0.01 },
}

export interface SeedState {
  seed: number
}

// Only touches the control panel, the params object, and the seed state --
// no imports from render/. (Workflow principle 5: exposed parameters;
// workflow principle 6/lock discussion: macros/params can override a
// reseed.) There are no macros yet -- locks apply to the four individual
// params until a real design principle introduces bundled ones.
export function createControls(params: GenerationParams, seedState: SeedState, onChange: () => void): Pane {
  const pane = new Pane({ title: 'Parameters' })
  const locked: Record<ParamKey, boolean> = {
    depth: false,
    branchAngle: false,
    lengthDecay: false,
    angleJitter: false,
  }

  for (const key of Object.keys(PARAM_RANGES) as ParamKey[]) {
    pane.addBinding(params, key, PARAM_RANGES[key])
  }

  const lockFolder = pane.addFolder({ title: 'Lock (survives new seed)' })
  for (const key of Object.keys(PARAM_RANGES) as ParamKey[]) {
    lockFolder.addBinding(locked, key)
  }

  pane.on('change', onChange)

  pane.addButton({ title: 'New random seed' }).on('click', () => {
    seedState.seed = Math.floor(Math.random() * 2 ** 31)

    // Params ride along with the seed too, except where locked -- derived
    // from the new seed itself so the whole (seed, params) pair stays
    // reproducible from that one number (principle 3), not from ambient
    // randomness sprinkled through the UI.
    const rng = mulberry32(deriveSeed(seedState.seed, 0xf00d))
    for (const key of Object.keys(PARAM_RANGES) as ParamKey[]) {
      if (locked[key]) continue
      const { min, max, step } = PARAM_RANGES[key]
      const steps = Math.round((max - min) / step)
      params[key] = min + Math.round(rng() * steps) * step
    }

    pane.refresh()
    onChange()
  })

  return pane
}
