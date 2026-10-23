
import test from 'node:test'
import assert from 'node:assert/strict'

import {
  isIso,
  addDays,
  addMonths,
  isTaskDateValid,
} from '../src/dateUtils.js'

test('valid calendar dates', () => {
  assert.equal(isIso('2026-02-28'), true)
  assert.equal(isIso('2024-02-29'), true)
})

test('invalid calendar dates', () => {
  assert.equal(isIso('2026-02-30'), false)
  assert.equal(isIso('2025-02-29'), false)
  assert.equal(isIso('2026-13-01'), false)
  assert.equal(isIso(''), false)
  assert.equal(isIso(null), false)
})

test('day calculation', () => {
  assert.equal(addDays('2026-01-31', 1), '2026-02-01')
  assert.equal(addDays('2024-02-28', 1), '2024-02-29')
})

test('month calculation', () => {
  assert.equal(addMonths('2026-01-31', 1), '2026-02-28')
  assert.equal(addMonths('2024-01-31', 1), '2024-02-29')
})

test('task date validation', () => {
  assert.equal(
    isTaskDateValid('2026-10-20', '2026-10-21'),
    true
  )

  assert.equal(
    isTaskDateValid('2026-10-20', '2026-10-19'),
    false
  )

  assert.equal(
    isTaskDateValid('2026-10-20', '2026-02-30'),
    false
  )
})
