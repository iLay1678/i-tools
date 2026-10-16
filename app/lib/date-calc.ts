// 日期计算：间隔 / 加减 / 工作日 / 年龄（封装 date-fns，零新增依赖）。
// 契约见设计文档 §3.8。风格：单引号 + 无分号。

import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarDays,
  differenceInMonths,
  format,
  isWeekend,
  isValid,
  parseISO,
} from 'date-fns'

export type DateUnit = 'day' | 'week' | 'month' | 'year'

export interface IntervalResult {
  years: number
  months: number
  days: number
  totalDays: number
  totalWeeks: number
  remainderDays: number
}

export interface AddResult {
  date: Date
  weekday: string // 中文星期，如 '星期三'
}

export interface WorkdayResult {
  date: Date
  weekendDays: number // 跨过的周末天数
}

const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function toDateInputValue(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function isValidDateInput(value: string): boolean {
  const trimmed = value.trim()
  if (!DATE_INPUT_PATTERN.test(trimmed)) return false
  const date = parseISO(trimmed)
  if (!isValid(date)) return false
  return toDateInputValue(date) === trimmed
}

export function calcInterval(start: Date, end: Date): IntervalResult {
  const [from, to] = start.getTime() <= end.getTime() ? [start, end] : [end, start]

  const totalDays = differenceInCalendarDays(to, from)
  // 必须用 differenceInMonths（按“完整月”计数），而非 differenceInCalendarMonths（按日历月边界计数）：
  // 后者在日号不等的区间会多算一个月，使 addMonths 越过结束日、天数出现负数。
  let months = differenceInMonths(to, from)
  let anchor = addMonths(from, months)
  // 防御：极端月末钳制下若锚点仍越过结束日，则回退一个月，保证 days >= 0。
  if (anchor.getTime() > to.getTime()) {
    months -= 1
    anchor = addMonths(from, months)
  }
  // 用 differenceInCalendarDays 而非 differenceInDays：二者对现代日期结果一致，
  // 但前者按“日历天”计数，能避免跨夏令时/历史时区偏移（如 1948 年 CST 为 +09:00）时少算 1 天。
  const days = differenceInCalendarDays(to, anchor)
  const years = Math.floor(months / 12)
  const remainderMonths = months % 12 // 恒落在 0..11

  const totalWeeks = Math.floor(totalDays / 7)
  const remainderDays = totalDays - totalWeeks * 7

  return { years, months: remainderMonths, days, totalDays, totalWeeks, remainderDays }
}

export function addToDate(base: Date, amount: number, unit: DateUnit): AddResult {
  const apply: Record<DateUnit, (date: Date, value: number) => Date> = {
    day: addDays,
    week: addWeeks,
    month: addMonths,
    year: addYears,
  }
  const date = apply[unit](base, amount)
  return { date, weekday: WEEKDAYS[date.getDay()] }
}

export function calcWorkday(start: Date, days: number, includeStart: boolean): WorkdayResult {
  const total = Math.max(0, Math.floor(days))
  let cursor = new Date(start.getTime())
  let weekendDays = 0
  let steps = includeStart ? total - 1 : total

  while (steps > 0) {
    cursor = addDays(cursor, 1)
    if (isWeekend(cursor)) {
      weekendDays += 1
    } else {
      steps -= 1
    }
  }

  return { date: cursor, weekendDays }
}

export function calcAge(birth: Date, reference: Date): IntervalResult {
  return calcInterval(birth, reference)
}
