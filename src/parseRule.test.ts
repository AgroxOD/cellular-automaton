import { describe, expect, it } from 'vitest'
import { parseRule } from './ruleParser'

describe('parseRule', () => {
  it('filters negatives and numbers greater than 12', () => {
    const result = parseRule('-1,5,13')
    expect(result.values).toEqual([5])
    expect(result.valid).toBe(false)
  })

  it('removes duplicates and validates', () => {
    const result = parseRule('2,2,3')
    expect(result.values).toEqual([2, 3])
    expect(result.valid).toBe(true)
  })

  it('sorts values ascending', () => {
    const result = parseRule('3,1,2')
    expect(result.values).toEqual([1, 2, 3])
    expect(result.valid).toBe(true)
  })

  it('detects invalid inputs', () => {
    const result = parseRule('a,b')
    expect(result.values).toEqual([])
    expect(result.valid).toBe(false)
  })
})
