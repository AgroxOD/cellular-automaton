import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { createRhombicDodecahedronGeometry, generateFCCLattice, step } from './ca'
import { parseRule } from './ruleParser'
import './App.css'

const DEFAULT_BORN = [3]
const DEFAULT_SURVIVE = [2, 3]

function App() {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const cellsRef = useRef<number[]>([])
  const neighborsRef = useRef<number[][]>([])
  const meshRef = useRef<THREE.InstancedMesh | null>(null)
  const bufferRef = useRef<number[]>([])
  const [bornText, setBornText] = useState('3')
  const [surviveText, setSurviveText] = useState('2,3')
  const [born, setBorn] = useState<number[]>(DEFAULT_BORN)
  const [survive, setSurvive] = useState<number[]>(DEFAULT_SURVIVE)
  const [bornError, setBornError] = useState<string | null>(null)
  const [surviveError, setSurviveError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [radius, setRadius] = useState(3)

  useEffect(() => {
    const { values, valid } = parseRule(bornText)
    if (valid) {
      setBorn(values)
      setBornError(null)
    } else {
      setBorn(DEFAULT_BORN)
      setBornError('Invalid born rule')
    }
  }, [bornText])

  useEffect(() => {
    const { values, valid } = parseRule(surviveText)
    if (valid) {
      setSurvive(values)
      setSurviveError(null)
    } else {
      setSurvive(DEFAULT_SURVIVE)
      setSurviveError('Invalid survive rule')
    }
  }, [surviveText])

  useEffect(() => {
    const container = mountRef.current!
    const width = container.clientWidth
    const height = container.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.z = 3

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    container.appendChild(renderer.domElement)

    const { positions, neighbors } = generateFCCLattice(radius)
    const cellGeometry = createRhombicDodecahedronGeometry(0.2)
    const material = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0, roughness: 1 })
    const mesh = new THREE.InstancedMesh(
      cellGeometry,
      material,
      positions.length,
    )
    const ambient = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambient)
    const dir = new THREE.DirectionalLight(0xffffff, 0.8)
    dir.position.set(5, 5, 5)
    scene.add(dir)
    const cells = positions.map(() => (Math.random() > 0.5 ? 1 : 0))
    cellsRef.current = cells
    neighborsRef.current = neighbors
    bufferRef.current = new Array(cells.length).fill(0)
    const color = new THREE.Color()
    const matrix = new THREE.Matrix4()
    positions.forEach((v, i) => {
      matrix.setPosition(v)
      mesh.setMatrixAt(i, matrix)
      color.set(cells[i] ? 0x00ff00 : 0x444444)
      mesh.setColorAt(i, color)
    })
    mesh.instanceMatrix.needsUpdate = true
    mesh.instanceColor!.needsUpdate = true
    scene.add(mesh)
    meshRef.current = mesh

    const animate = () => {
      requestAnimationFrame(animate)
      const m = meshRef.current
      if (m) {
        m.rotation.x += 0.01
        m.rotation.y += 0.01
      }
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        renderer.dispose()
        if (meshRef.current) {
          meshRef.current.geometry.dispose()
          ;(meshRef.current.material as THREE.Material).dispose()
          scene.remove(meshRef.current)
          meshRef.current = null
        }
        cellsRef.current = []
        neighborsRef.current = []
        bufferRef.current = []
        container.removeChild(renderer.domElement)
      }
  }, [radius])

  const tick = useCallback(() => {
    const cells = cellsRef.current
    const neighbors = neighborsRef.current
    const buffer = bufferRef.current
    const next = step(cells, neighbors, born, survive, buffer)
    bufferRef.current = cells
    cellsRef.current = next
    const mesh = meshRef.current
    if (mesh && mesh.instanceColor) {
      const color = new THREE.Color()
      next.forEach((v, i) => {
        color.set(v ? 0x00ff00 : 0x444444)
        mesh.setColorAt(i, color)
      })
      mesh.instanceColor.needsUpdate = true
    }
  }, [born, survive])

  useEffect(() => {
    if (!running) return
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [running, tick])

  return (
    <div>
      <div ref={mountRef} className="scene-container" />
      <div className="controls">
        <label>
          radius:
          <input
            type="number"
            min={1}
            value={radius}
            onChange={(e) =>
              setRadius(
                Number.isNaN(e.target.valueAsNumber)
                  ? 1
                  : Math.max(1, Math.round(e.target.valueAsNumber)),
              )
            }
          />
        </label>
        <label>
          born:
          <input
            value={bornText}
            onChange={(e) => setBornText(e.target.value)}
          />
          {bornError && <span style={{ color: 'red' }}>{bornError}</span>}
        </label>
        <label>
          survive:
          <input
            value={surviveText}
            onChange={(e) => setSurviveText(e.target.value)}
          />
          {surviveError && <span style={{ color: 'red' }}>{surviveError}</span>}
        </label>
        <button onClick={() => setRunning((r) => !r)}>{running ? 'Stop' : 'Start'}</button>
        <button onClick={tick}>Step</button>
      </div>
    </div>
  )
}

export default App
