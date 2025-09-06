export function parseRule(text: string): { values: number[]; valid: boolean } {
  const parts = text.split(',')
  const nums: number[] = []
  let valid = parts.length > 0
  for (const part of parts) {
    const n = parseInt(part.trim(), 10)
    if (Number.isNaN(n) || n < 0 || n > 12) {
      valid = false
      continue
    }
    nums.push(n)
  }
  const values = Array.from(new Set(nums)).sort((a, b) => a - b)
  if (values.length === 0) valid = false
  return { values, valid }
}
