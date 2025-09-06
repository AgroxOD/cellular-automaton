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
    neighborMap[i] = Array.from(new Set(arr))
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
    const dedup = Array.from(new Set(arr))
    if (dedup.length !== 3) {
      throw new Error(`Vertex ${i} expected 3 neighbors, got ${dedup.length}`)
    }
    neighborMap[i] = dedup
  })

  return { vertices, neighbors: neighborMap }
}

export function step(
  cells: number[],
  neighbors: number[][],
  born: number[],
  survive: number[],
): number[] {
  return cells.map((cell, i) => {
    const count = neighbors[i].reduce((sum, n) => sum + cells[n], 0)
    return cell ? (survive.includes(count) ? 1 : 0) : born.includes(count) ? 1 : 0
  })
}
