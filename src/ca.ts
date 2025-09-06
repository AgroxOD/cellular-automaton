import * as THREE from 'three'

export function generateIcosahedronNeighbors(): {
  vertices: THREE.Vector3[]
  neighbors: number[][]
} {
  const icoGeometry = new THREE.IcosahedronGeometry(1)
  const positions = icoGeometry.getAttribute('position') as THREE.BufferAttribute
  const vertices: THREE.Vector3[] = []
  const vertexMap = new Map<string, number>()
  const neighborMap: number[][] = []

  const getIndex = (v: THREE.Vector3): number => {
    const key = v.toArray().join(',')
    let idx = vertexMap.get(key)
    if (idx === undefined) {
      idx = vertices.length
      vertexMap.set(key, idx)
      vertices.push(v.clone())
      neighborMap[idx] = []
    }
    return idx
  }

  for (let i = 0; i < positions.count; i += 3) {
    const a = getIndex(new THREE.Vector3().fromBufferAttribute(positions, i))
    const b = getIndex(new THREE.Vector3().fromBufferAttribute(positions, i + 1))
    const c = getIndex(new THREE.Vector3().fromBufferAttribute(positions, i + 2))
    neighborMap[a].push(b, c)
    neighborMap[b].push(a, c)
    neighborMap[c].push(a, b)
  }

  neighborMap.forEach((arr, i) => {
    neighborMap[i] = Array.from(new Set(arr)).sort((a, b) => a - b)
  })

  neighborMap.forEach((arr, i) => {
    arr.forEach((j) => {
      if (!neighborMap[j].includes(i)) {
        throw new Error(`Neighbor symmetry broken between ${i} and ${j}`)
      }
    })
  })

  return { vertices, neighbors: neighborMap }
}

export function generateDodecahedronNeighbors(): {
  vertices: THREE.Vector3[]
  neighbors: number[][]
} {
  const dodeGeometry = new THREE.DodecahedronGeometry(1)
  const edgeGeometry = new THREE.EdgesGeometry(dodeGeometry)
  const positions = edgeGeometry.getAttribute('position') as THREE.BufferAttribute
  const vertices: THREE.Vector3[] = []
  const vertexMap = new Map<string, number>()
  const neighborMap: number[][] = []

  const getIndex = (v: THREE.Vector3): number => {
    const key = v.toArray().join(',')
    let idx = vertexMap.get(key)
    if (idx === undefined) {
      idx = vertices.length
      vertexMap.set(key, idx)
      vertices.push(v.clone())
      neighborMap[idx] = []
    }
    return idx
  }

  for (let i = 0; i < positions.count; i += 2) {
    const a = getIndex(new THREE.Vector3().fromBufferAttribute(positions, i))
    const b = getIndex(new THREE.Vector3().fromBufferAttribute(positions, i + 1))
    neighborMap[a].push(b)
    neighborMap[b].push(a)
  }

  neighborMap.forEach((arr, i) => {
    const dedup = Array.from(new Set(arr)).sort((a, b) => a - b)
    if (dedup.length !== 3) {
      throw new Error(`Vertex ${i} expected 3 neighbors, got ${dedup.length}`)
    }
    neighborMap[i] = dedup
  })

  neighborMap.forEach((arr, i) => {
    arr.forEach((j) => {
      if (!neighborMap[j].includes(i)) {
        throw new Error(`Neighbor symmetry broken between ${i} and ${j}`)
      }
    })
  })

  return { vertices, neighbors: neighborMap }
}

export function generateFCCLattice(radius: number): {
  positions: THREE.Vector3[]
  neighbors: number[][]
} {
  const positions: THREE.Vector3[] = []
  const indexMap = new Map<string, number>()
  const neighborMap: number[][] = []

  for (let x = -radius; x <= radius; x++) {
    for (let y = -radius; y <= radius; y++) {
      for (let z = -radius; z <= radius; z++) {
        if ((x + y + z) % 2 !== 0) continue
        const v = new THREE.Vector3(x, y, z)
        const idx = positions.length
        positions.push(v)
        indexMap.set(v.toArray().join(','), idx)
        neighborMap[idx] = []
      }
    }
  }

  const offsets = [
    [1, 1, 0],
    [1, -1, 0],
    [-1, 1, 0],
    [-1, -1, 0],
    [1, 0, 1],
    [1, 0, -1],
    [-1, 0, 1],
    [-1, 0, -1],
    [0, 1, 1],
    [0, 1, -1],
    [0, -1, 1],
    [0, -1, -1],
  ] as const

  positions.forEach((v, i) => {
    offsets.forEach(([dx, dy, dz]) => {
      const key = [v.x + dx, v.y + dy, v.z + dz].join(',')
      const idx = indexMap.get(key)
      if (idx !== undefined) neighborMap[i].push(idx)
    })
    neighborMap[i].sort((a, b) => a - b)
  })

  neighborMap.forEach((arr, i) => {
    arr.forEach((j) => {
      if (!neighborMap[j].includes(i)) {
        throw new Error(`Neighbor symmetry broken between ${i} and ${j}`)
      }
    })
  })

  return { positions, neighbors: neighborMap }
}

export function step(
  cells: number[],
  neighbors: number[][],
  born: number[],
  survive: number[],
  out?: number[],
): number[] {
  const result = out ?? new Array<number>(cells.length)
  if (result.length !== cells.length) result.length = cells.length

  for (let i = 0; i < cells.length; i++) {
    const count = neighbors[i].reduce((sum, n) => sum + cells[n], 0)
    result[i] = cells[i]
      ? survive.includes(count)
        ? 1
        : 0
      : born.includes(count)
        ? 1
        : 0
  }

  return result
}
