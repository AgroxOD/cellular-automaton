import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { generateDodecahedronNeighbors, step } from './ca'
import './App.css'

function parseRule(text: string): number[] {
  return text
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n))
}

function App() {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const cellsRef = useRef<number[]>([])
  const neighborsRef = useRef<number[][]>([])
  const meshesRef = useRef<THREE.Mesh[]>([])
  const [bornText, setBornText] = useState('3')
  const [surviveText, setSurviveText] = useState('2,3')
  const [born, setBorn] = useState<number[]>([3])
  const [survive, setSurvive] = useState<number[]>([2, 3])
  const [running, setRunning] = useState(false)

  useEffect(() => {
    setBorn(parseRule(bornText))
  }, [bornText])

  useEffect(() => {
    setSurvive(parseRule(surviveText))
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

    const dodecaGeometry = new THREE.DodecahedronGeometry(1)
    const dodecaMaterial = new THREE.MeshNormalMaterial({ wireframe: true })
    const dodecahedron = new THREE.Mesh(dodecaGeometry, dodecaMaterial)
    scene.add(dodecahedron)

    const { vertices, neighbors } = generateDodecahedronNeighbors()
    const sphereGeometry = new THREE.SphereGeometry(0.05, 16, 16)
    const deadMaterial = new THREE.MeshBasicMaterial({ color: 0x222222 })
    const aliveMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })

    const cells = vertices.map(() => (Math.random() > 0.5 ? 1 : 0))
    cellsRef.current = cells
    neighborsRef.current = neighbors
    const meshes = vertices.map((v, i) => {
      const material = cells[i] ? aliveMaterial.clone() : deadMaterial.clone()
      const sphere = new THREE.Mesh(sphereGeometry, material)
      sphere.position.copy(v)
      scene.add(sphere)
      return sphere
    })
    meshesRef.current = meshes

    const animate = () => {
      requestAnimationFrame(animate)
      dodecahedron.rotation.x += 0.01
      dodecahedron.rotation.y += 0.01
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
        dodecaGeometry.dispose()
        dodecaMaterial.dispose()
        meshesRef.current.forEach((mesh) => {
          mesh.geometry.dispose()
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose())
          } else {
            mesh.material.dispose()
          }
        })
        cellsRef.current = []
        neighborsRef.current = []
        meshesRef.current = []
        container.removeChild(renderer.domElement)
      }
  }, [])

  const tick = useCallback(() => {
    const cells = cellsRef.current
    const neighbors = neighborsRef.current
    const next = step(cells, neighbors, born, survive)
    cellsRef.current = next
    meshesRef.current.forEach((mesh, i) => {
      const mat = mesh.material as THREE.MeshBasicMaterial
      mat.color.set(next[i] ? 0xff0000 : 0x222222)
    })
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
          born:
          <input
            value={bornText}
            onChange={(e) => setBornText(e.target.value)}
          />
        </label>
        <label>
          survive:
          <input
            value={surviveText}
            onChange={(e) => setSurviveText(e.target.value)}
          />
        </label>
        <button onClick={() => setRunning((r) => !r)}>{running ? 'Stop' : 'Start'}</button>
        <button onClick={tick}>Step</button>
      </div>
    </div>
  )
}

export default App
