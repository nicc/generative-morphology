import { deriveSeed, mulberry32 } from './rng'

export interface GenerationParams {
  depth: number
  branchAngle: number // radians, split angle from parent direction
  lengthDecay: number // fraction of parent length, applied per generation
  angleJitter: number // radians, max random deviation applied per branch
}

export const DEFAULT_PARAMS: GenerationParams = {
  depth: 5,
  branchAngle: 0.5,
  lengthDecay: 0.72,
  angleJitter: 0.15,
}

// Every generated node carries its own provenance -- which rule, which
// parameters, which seed produced it -- per principle 2. This is what a
// future inspector attaches to, and what render/structureRenderer.ts
// consumes without knowing anything about how it was produced.
export interface StructureNode {
  id: string
  rule: string
  seed: number
  params: GenerationParams
  from: [number, number]
  to: [number, number]
  children: StructureNode[]
}

const RULE_NAME = 'stub-branch'

// Placeholder generation rule: a trunk that recursively splits into two
// children, each shorter and rotated by ~branchAngle with seeded jitter.
// This exists only to prove the pipeline (generation -> structure ->
// renderer -> UI) end to end. It is not a stated design principle -- those
// don't exist yet -- and it will be replaced once real morphology rules do.
export function generateStructure(seed: number, params: GenerationParams = DEFAULT_PARAMS): StructureNode {
  return generateBranch(seed, params, '0', [0, -0.9], Math.PI / 2, 0.35, params.depth)
}

function generateBranch(
  seed: number,
  params: GenerationParams,
  path: string,
  from: [number, number],
  angle: number,
  length: number,
  remainingDepth: number,
): StructureNode {
  const rng = mulberry32(seed)
  const to: [number, number] = [from[0] + Math.cos(angle) * length, from[1] + Math.sin(angle) * length]

  const node: StructureNode = {
    id: `${RULE_NAME}:${path}`,
    rule: RULE_NAME,
    seed,
    params,
    from,
    to,
    children: [],
  }

  if (remainingDepth <= 0) {
    return node
  }

  const nextLength = length * params.lengthDecay
  const jitter = () => (rng() * 2 - 1) * params.angleJitter

  const leftSeed = deriveSeed(seed, 0)
  const rightSeed = deriveSeed(seed, 1)

  node.children.push(
    generateBranch(
      leftSeed,
      params,
      `${path}.0`,
      to,
      angle - params.branchAngle + jitter(),
      nextLength,
      remainingDepth - 1,
    ),
    generateBranch(
      rightSeed,
      params,
      `${path}.1`,
      to,
      angle + params.branchAngle + jitter(),
      nextLength,
      remainingDepth - 1,
    ),
  )

  return node
}
