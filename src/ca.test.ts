import { describe, expect, it } from 'vitest'
import { generateDodecahedronNeighbors, generateIcosahedronNeighbors, step } from './ca'

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
})
