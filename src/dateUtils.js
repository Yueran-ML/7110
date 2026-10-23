
const ISO = /^\d{4}-\d{2}-\d{2}$/

const pad = (n) => String(n).padStart(2, '0')

export const toIso = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export const todayIso = () => toIso(new Date())

export function isIso(value) {
  if (typeof value !== 'string' || !ISO.test(value)) {
    return false
  }

  const [year, month, day] = value.split('-').map(Number)

  const date = new Date(0)
  date.setFullYear(year, month - 1, day)

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

export function parseIso(value) {
  if (!isIso(value)) {
    throw new RangeError('Invalid calendar date')
  }

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(0)
  date.setFullYear(year, month - 1, day)
  return date
}

export function addDays(iso, days) {
  const date = parseIso(iso)
  date.setDate(date.getDate() + days)
  return toIso(date)
}

export function addMonths(iso, months) {
  const date = parseIso(iso)
  const day = date.getDate()

  date.setDate(1)
  date.setMonth(date.getMonth() + months)

  const lastDay = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate()

  date.setDate(Math.min(day, lastDay))
  return toIso(date)
}

export function shift(iso, rule) {
  return rule.months
    ? addMonths(iso, rule.months)
    : addDays(iso, rule.days)
}

export function daysUntil(iso) {
  const date = parseIso(iso)
  const today = parseIso(todayIso())

  const utc = (d) =>
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())

  return Math.round(
    (utc(date) - utc(today)) / 86400000
  )
}

export function isTaskDateValid(visitDate, taskDate) {
  return (
    isIso(visitDate) &&
    isIso(taskDate) &&
    taskDate >= visitDate
  )
}
