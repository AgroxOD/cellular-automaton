import * as THREE from 'three'
import { describe, expect, it } from 'vitest'
import { createRhombicDodecahedronGeometry, generateDodecahedronNeighbors, generateIcosahedronNeighbors, generateFCCLattice, step } from './ca'

describe('createRhombicDodecahedronGeometry', () => {
  const geometry = createRhombicDodecahedronGeometry()
  it('has 14 unique vertices', () => {
    const pos = geometry.getAttribute('position') as THREE.BufferAttribute
    const vertices = new Set<string>()
    for (let i = 0; i < pos.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(pos, i)
      vertices.add(v.toArray().map((n) => n.toFixed(3)).join(','))
    }
    expect(vertices.size).toBe(14)
  })
})

describe('generateIcosahedronNeighbors', () => {
  const { neighbors } = generateIcosahedronNeighbors()
  it('creates 12 vertices', () => {
    expect(neighbors).toHaveLength(12)
  })
  it('each vertex has 5 neighbors', () => {
    neighbors.forEach((list) => expect(list).toHaveLength(5))
  })
  it('neighbor relation is symmetric', () => {
    neighbors.forEach((list, i) => {
      const unique = new Set(list)
      expect(unique.size).toBe(list.length)
      unique.forEach((n) => {
        expect(neighbors[n]).toContain(i)
      })
    })
  })
  it('neighbor order is deterministic', () => {
    neighbors.forEach((list) => {
      const sorted = [...list].sort((a, b) => a - b)
      expect(list).toEqual(sorted)
    })
  })
})

describe('generateDodecahedronNeighbors', () => {
  const { neighbors } = generateDodecahedronNeighbors()
  it('creates 20 vertices', () => {
    expect(neighbors).toHaveLength(20)
  })
  it('each vertex has 3 neighbors', () => {
    neighbors.forEach((list) => expect(list).toHaveLength(3))
  })
  it('neighbor relation is symmetric', () => {
    neighbors.forEach((list, i) => {
      const unique = new Set(list)
      expect(unique.size).toBe(list.length)
      unique.forEach((n) => {
        expect(neighbors[n]).toContain(i)
      })
    })
  })
  it('neighbor order is deterministic', () => {
    neighbors.forEach((list) => {
      const sorted = [...list].sort((a, b) => a - b)
      expect(list).toEqual(sorted)
    })
  })
})

describe('generateFCCLattice', () => {
  const { positions, neighbors } = generateFCCLattice(1)
  const coords = positions.map((v) => [v.x, v.y, v.z])
  it('positions have even parity', () => {
    coords.forEach(([x, y, z]) => expect(Math.abs((x + y + z) % 2)).toBe(0))
  })
  it('center has 12 neighbors', () => {
    const center = coords.findIndex(([x, y, z]) => x === 0 && y === 0 && z === 0)
    expect(neighbors[center]).toHaveLength(12)
  })
  it('neighbor relation is symmetric', () => {
    neighbors.forEach((list, i) => {
      const unique = new Set(list)
      expect(unique.size).toBe(list.length)
      unique.forEach((n) => {
        expect(neighbors[n]).toContain(i)
      })
    })
  })
  it('neighbor order is deterministic', () => {
    neighbors.forEach((list) => {
      const sorted = [...list].sort((a, b) => a - b)
      expect(list).toEqual(sorted)
    })
  })
})

describe('step', () => {
  const born = [3]
  const survive = [2, 3]
  const tetraNeighbors = [
    [1, 2, 3],
    [0, 2, 3],
    [0, 1, 3],
    [0, 1, 2],
  ]

  it('birth with three neighbors', () => {
    const cells = [0, 1, 1, 1]
    const next = step(cells, tetraNeighbors, born, survive)
    expect(next[0]).toBe(1)
  })

  it('survival with two neighbors', () => {
    const cells = [1, 1, 1, 0]
    const next = step(cells, tetraNeighbors, born, survive)
    expect(next[0]).toBe(1)
  })

  it('death by isolation', () => {
    const cells = [1, 1, 0, 0]
    const next = step(cells, tetraNeighbors, born, survive)
    expect(next[0]).toBe(0)
  })

  it('death by overpopulation', () => {
    const neighborsOver = [[1, 2, 3, 4], [0], [0], [0], [0]]
    const cells = [1, 1, 1, 1, 1]
    const next = step(cells, neighborsOver, born, survive)
    expect(next[0]).toBe(0)
  })

  it('writes output to provided array', () => {
    const cells = [0, 1, 1, 1]
    const out: number[] = []
    const next = step(cells, tetraNeighbors, born, survive, out)
    expect(next).toBe(out)
    expect(next[0]).toBe(1)
    expect(cells[0]).toBe(0)
  })

  it('handles duplicate rule entries', () => {
    const cells = [0, 1, 1, 1]
    const bornDup = [3, 3]
    const surviveDup = [2, 3, 3]
    const next = step(cells, tetraNeighbors, bornDup, surviveDup)
    expect(next[0]).toBe(1)
  })
})
