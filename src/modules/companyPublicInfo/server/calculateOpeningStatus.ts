
import type { BusinessHourInput } from "./validation";

export type OpeningStatus =
  | "OPEN"
  | "CLOSED"
  | "TEMPORARILY_CLOSED"
  | "UNKNOWN";

type CalculateOpeningStatusInput = {
  timezone: string;
  businessHours: BusinessHourInput[];
  hasConfiguredHours: boolean;
  isTemporarilyClosed: boolean;
  now?: Date;
};

type LocalDateTime = {
  dayOfWeek: number;
  minutes: number;
};

function getLocalDateTime(
  date: Date,
  timezone: string,
): LocalDateTime | null {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });

    const parts = formatter.formatToParts(date);

    const weekday = parts.find(
      (part) => part.type === "weekday",
    )?.value;

    const hour = Number(
      parts.find((part) => part.type === "hour")?.value,
    );

    const minute = Number(
      parts.find((part) => part.type === "minute")?.value,
    );

    const dayOfWeek = [
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
    ].indexOf(weekday ?? "");

    if (
      dayOfWeek === -1 ||
      !Number.isInteger(hour) ||
      !Number.isInteger(minute) ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      return null;
    }

    return {
      dayOfWeek,
      minutes: hour * 60 + minute,
    };
  } catch {
    // Zona horaria IANA inválida.
    return null;
  }
}

function toMinutes(time: string): number | null {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    return null;
  }

  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

export function calculateOpeningStatus({
  timezone,
  businessHours,
  hasConfiguredHours,
  isTemporarilyClosed,
  now = new Date(),
}: CalculateOpeningStatusInput): OpeningStatus {
  // El cierre temporal tiene prioridad absoluta.
  if (isTemporarilyClosed) {
    return "TEMPORARILY_CLOSED";
  }

  if (
    !hasConfiguredHours ||
    !Array.isArray(businessHours) ||
    businessHours.length !== 7 ||
    !Number.isFinite(now.getTime())
  ) {
    return "UNKNOWN";
  }

  const local = getLocalDateTime(now, timezone);

  if (!local) {
    return "UNKNOWN";
  }

  const days = new Map<number, BusinessHourInput>();

  for (const day of businessHours) {
    if (
      !Number.isInteger(day.dayOfWeek) ||
      day.dayOfWeek < 0 ||
      day.dayOfWeek > 6 ||
      days.has(day.dayOfWeek)
    ) {
      return "UNKNOWN";
    }

    if (day.isClosed) {
      if (day.opensAt !== null || day.closesAt !== null) {
        return "UNKNOWN";
      }
    } else {
      if (
        typeof day.opensAt !== "string" ||
        typeof day.closesAt !== "string"
      ) {
        return "UNKNOWN";
      }

      const opens = toMinutes(day.opensAt);
      const closes = toMinutes(day.closesAt);

      if (
        opens === null ||
        closes === null ||
        opens === closes
      ) {
        return "UNKNOWN";
      }
    }

    days.set(day.dayOfWeek, day);
  }

  if (days.size !== 7) {
    return "UNKNOWN";
  }

  const today = days.get(local.dayOfWeek)!;
  const previousDay = days.get(
    (local.dayOfWeek + 6) % 7,
  )!;

  // Primero revisamos si sigue abierto por un horario
  // nocturno que comenzó el día anterior.
  if (!previousDay.isClosed) {
    const previousOpens = toMinutes(
      previousDay.opensAt!,
    )!;

    const previousCloses = toMinutes(
      previousDay.closesAt!,
    )!;

    if (
      previousCloses < previousOpens &&
      local.minutes < previousCloses
    ) {
      return "OPEN";
    }
  }

  if (today.isClosed) {
    return "CLOSED";
  }

  const opens = toMinutes(today.opensAt!)!;
  const closes = toMinutes(today.closesAt!)!;

  if (closes > opens) {
    // Horario normal, por ejemplo 09:00–18:00.
    return local.minutes >= opens &&
      local.minutes < closes
      ? "OPEN"
      : "CLOSED";
  }

  // Horario nocturno, por ejemplo 18:00–02:00.
  // La parte posterior a medianoche se revisa
  // cuando ese día se convierte en el anterior.
  return local.minutes >= opens
    ? "OPEN"
    : "CLOSED";
}
