import { and, gte, lt } from "drizzle-orm"
import type { AnyColumn } from "drizzle-orm"
type DateColumn = AnyColumn<{
    data: Date
}>

function startOfDay(date: Date) {

    const result = new Date(date)

    result.setHours(0, 0, 0, 0)

    return result

}

function addDays(date: Date, days: number) {

    const result = new Date(date)

    result.setDate(result.getDate() + days)

    return result

}

export function today(column: DateColumn) {

    const start = startOfDay(new Date())

    const end = addDays(start, 1)

    return and(

        gte(column, start),

        lt(column, end)

    )

}

export function nextDays(
    column: DateColumn,
    days: number
) {

    const start = new Date()

    const end = addDays(start, days)

    return and(

        gte(column, start),

        lt(column, end)

    )

}

export function thisMonth(column: DateColumn) {

    const now = new Date()

    const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
    )

    const end = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1
    )

    return and(

        gte(column, start),

        lt(column, end)

    )

}

export function lastMonth(column: DateColumn) {

    const now = new Date()

    const start = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
    )

    const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
    )

    return and(

        gte(column, start),

        lt(column, end)

    )

}
