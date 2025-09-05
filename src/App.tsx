import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import './App.css'

function App() {
  const mountRef = useRef<HTMLDivElement | null>(null)

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

    const sphereGeometry = new THREE.SphereGeometry(0.05, 16, 16)
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const positions = dodecaGeometry.getAttribute('position')
    const vertices: THREE.Vector3[] = []
    for (let i = 0; i < positions.count; i++) {
      const vertex = new THREE.Vector3().fromBufferAttribute(positions, i)
      if (!vertices.some((v) => v.equals(vertex))) {
        vertices.push(vertex.clone())
      }
    }
    vertices.forEach((v) => {
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
      sphere.position.copy(v)
      scene.add(sphere)
    })

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
      container.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="scene-container" />
}

export default App
