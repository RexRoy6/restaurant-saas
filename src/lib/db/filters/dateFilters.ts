import { and, gte, lt } from "drizzle-orm"

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

export function today(column: any) {

    const start = startOfDay(new Date())

    const end = addDays(start, 1)

    return and(

        gte(column, start),

        lt(column, end)

    )

}

export function nextDays(
    column: any,
    days: number
) {

    const start = new Date()

    const end = addDays(start, days)

    return and(

        gte(column, start),

        lt(column, end)

    )

}

export function thisMonth(column: any) {

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

export function lastMonth(column: any) {

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
