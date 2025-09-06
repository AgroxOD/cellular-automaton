import { step } from './src/ca'
import { performance } from 'perf_hooks'

const N = 100000
const iterations = 100
const born = [1]
const survive = [1]
const neighbors = Array.from({ length: N }, (_, i) => [
  (i - 1 + N) % N,
  (i + 1) % N,
])
const initial = Array.from({ length: N }, () => (Math.random() > 0.5 ? 1 : 0))

function run(useOut: boolean) {
  let a = initial.slice()
  let b = new Array<number>(N).fill(0)
  const start = performance.now()
  for (let i = 0; i < iterations; i++) {
    if (useOut) {
      step(a, neighbors, born, survive, b)
      ;[a, b] = [b, a]
    } else {
      a = step(a, neighbors, born, survive)
    }
  }
  const time = performance.now() - start
  const mem = process.memoryUsage().heapUsed / 1024 / 1024
  console.log(useOut ? 'with out' : 'without out', { time, mem })
}

run(false)
run(true)
