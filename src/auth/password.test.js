import { describe, expect, it } from 'vitest'
import { passwordProblem } from './password'

// Each case breaks exactly one rule and satisfies the others.
describe('passwordProblem', () => {
  it('accepts a password that meets every rule', () => {
    expect(passwordProblem('Abcdef1!')).toBe('')
  })

  it.each([
    ['too short', 'Ab1!xyz'],
    ['no lowercase', 'ABCDEF1!'],
    ['no uppercase', 'abcdef1!'],
    ['no digit', 'Abcdefg!'],
    ['no symbol', 'Abcdefg1'],
  ])('rejects %s', (_name, password) => {
    expect(passwordProblem(password)).not.toBe('')
  })
})
