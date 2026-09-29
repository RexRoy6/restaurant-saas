import type {
  SalesPeriod,
  SalesPeriodRange,
} from "../types/sales";

type LocalDate = {
  year: number;
  month: number;
  day: number;
};

function getLocalDate(
  date: Date,
  timezone: string,
): LocalDate {
  const formatter = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: timezone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
    },
  );

  const parts = formatter.formatToParts(date);

  const year = Number(
    parts.find((part) => part.type === "year")
      ?.value,
  );

  const month = Number(
    parts.find((part) => part.type === "month")
      ?.value,
  );

  const day = Number(
    parts.find((part) => part.type === "day")
      ?.value,
  );

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    throw new Error(
      `Could not resolve local date for timezone: ${timezone}`,
    );
  }

  return {
    year,
    month,
    day,
  };
}

function addDays(
  date: LocalDate,
  days: number,
): LocalDate {
  const utcDate = new Date(
    Date.UTC(
      date.year,
      date.month - 1,
      date.day + days,
    ),
  );

  return {
    year: utcDate.getUTCFullYear(),
    month: utcDate.getUTCMonth() + 1,
    day: utcDate.getUTCDate(),
  };
}

function zonedStartOfDayToUtc(
  localDate: LocalDate,
  timezone: string,
): Date {
  const guess = new Date(
    Date.UTC(
      localDate.year,
      localDate.month - 1,
      localDate.day,
      0,
      0,
      0,
      0,
    ),
  );

  const formatter = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: timezone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hourCycle: "h23",
    },
  );

  const getOffset = (date: Date) => {
    const parts = formatter.formatToParts(date);

    const values = Object.fromEntries(
      parts
        .filter((part) => part.type !== "literal")
        .map((part) => [
          part.type,
          Number(part.value),
        ]),
    );

    const asUtc = Date.UTC(
      values.year,
      values.month - 1,
      values.day,
      values.hour,
      values.minute,
      values.second,
    );

    return asUtc - date.getTime();
  };

  let result = new Date(
    guess.getTime() - getOffset(guess),
  );

  // Recalculate once using the resulting instant.
  // This handles offset changes around DST boundaries.
  result = new Date(
    guess.getTime() - getOffset(result),
  );

  return result;
}

export function getSalesPeriod(
  preset: SalesPeriod,
  timezone: string,
  now = new Date(),
): SalesPeriodRange {
  const today = getLocalDate(now, timezone);

  let fromLocal: LocalDate;
  let toLocal: LocalDate;

  switch (preset) {
    case "today":
      fromLocal = today;
      toLocal = addDays(today, 1);
      break;

    case "yesterday":
      fromLocal = addDays(today, -1);
      toLocal = today;
      break;

    case "last5days":
      fromLocal = addDays(today, -4);
      toLocal = addDays(today, 1);
      break;

    case "last7days":
      fromLocal = addDays(today, -6);
      toLocal = addDays(today, 1);
      break;

    case "last30days":
      fromLocal = addDays(today, -29);
      toLocal = addDays(today, 1);
      break;

    default: {
      const exhaustiveCheck: never = preset;
      throw new Error(
        `Unsupported sales period: ${exhaustiveCheck}`,
      );
    }
  }

  return {
    preset,
    timezone,
    from: zonedStartOfDayToUtc(
      fromLocal,
      timezone,
    ),
    to: zonedStartOfDayToUtc(
      toLocal,
      timezone,
    ),
  };
}