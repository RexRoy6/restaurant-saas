
/* src/modules/companyPublicInfo/server/validation.ts */

export type BusinessHourInput = {
  dayOfWeek: number;
  isClosed: boolean;
  opensAt: string | null;
  closesAt: string | null;
};

export type CompanyPublicInfoInput = {
  googleMapsUrl: string | null;
  isTemporarilyClosed: boolean;
  temporaryClosureReason: string | null;
  businessHours: BusinessHourInput[];
};

export class PublicInfoValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PublicInfoValidationError";
  }
}

function fail(message: string): never {
  throw new PublicInfoValidationError(message);
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function parseGoogleMapsUrl(value: unknown): string | null {
  if (value === null) return null;

  if (typeof value !== "string") {
    return fail("googleMapsUrl debe ser un texto o null");
  }

  const trimmed = value.trim();

  if (trimmed === "") return null;

  if (trimmed.length > 2048) {
    return fail("El enlace de Google Maps es demasiado largo");
  }

  let url: URL;

  try {
    url = new URL(trimmed);
  } catch {
    return fail("El enlace de Google Maps no es válido");
  }

  if (url.protocol !== "https:") {
    return fail("El enlace de Google Maps debe usar HTTPS");
  }

  if (
    url.username ||
    url.password ||
    url.port
  ) {
    return fail("El enlace de Google Maps no es válido");
  }

  const hostname = url.hostname.toLowerCase();

  const isShortLink =
    hostname === "maps.app.goo.gl";

  const isMapsGoogle =
    hostname === "maps.google.com";

  const isGoogleMapsPath =
    hostname === "www.google.com" &&
    (
      url.pathname === "/maps" ||
      url.pathname.startsWith("/maps/")
    );

  if (
    !isShortLink &&
    !isMapsGoogle &&
    !isGoogleMapsPath
  ) {
    return fail(
      "Solo se permiten enlaces válidos de Google Maps",
    );
  }

  return url.toString();
}

function parseReason(value: unknown): string | null {
  if (value === null) return null;

  if (typeof value !== "string") {
    return fail(
      "temporaryClosureReason debe ser texto o null",
    );
  }

  const trimmed = value.trim();

  if (trimmed.length > 500) {
    return fail(
      "El motivo del cierre no puede superar 500 caracteres",
    );
  }

  return trimmed || null;
}

function parseTime(
  value: unknown,
  fieldName: string,
): string {
  if (typeof value !== "string") {
    return fail(`${fieldName} debe tener formato HH:mm`);
  }

  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);

  if (!match) {
    return fail(`${fieldName} debe tener formato HH:mm`);
  }

  return value;
}

function minutesFromTime(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function parseBusinessHours(
  value: unknown,
): BusinessHourInput[] {
  if (!Array.isArray(value) || value.length !== 7) {
    return fail(
      "businessHours debe contener exactamente 7 días",
    );
  }

  const days = new Set<number>();

  const hours = value.map((item): BusinessHourInput => {
    if (!isRecord(item)) {
      return fail("Cada horario debe ser un objeto");
    }

    const {
      dayOfWeek,
      isClosed,
      opensAt,
      closesAt,
    } = item;

    if (
      typeof dayOfWeek !== "number" ||
      !Number.isInteger(dayOfWeek) ||
      dayOfWeek < 0 ||
      dayOfWeek > 6
    ) {
      return fail("dayOfWeek debe estar entre 0 y 6");
    }

    if (days.has(dayOfWeek)) {
      return fail("No se permiten días duplicados");
    }

    days.add(dayOfWeek);

    if (typeof isClosed !== "boolean") {
      return fail("isClosed debe ser booleano");
    }

    if (isClosed) {
      if (opensAt !== null || closesAt !== null) {
        return fail(
          "Un día cerrado debe tener horas null",
        );
      }

      return {
        dayOfWeek,
        isClosed: true,
        opensAt: null,
        closesAt: null,
      };
    }

    const opening = parseTime(
      opensAt,
      `opensAt del día ${dayOfWeek}`,
    );

    const closing = parseTime(
      closesAt,
      `closesAt del día ${dayOfWeek}`,
    );

    if (opening === closing) {
      return fail(
        "La hora de apertura y cierre deben ser diferentes",
      );
    }

    return {
      dayOfWeek,
      isClosed: false,
      opensAt: opening,
      closesAt: closing,
    };
  });

  hours.sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  // Verificar que un horario nocturno no se solape
  // con el horario del día siguiente.
  for (let day = 0; day < 7; day++) {
    const current = hours[day];
    const next = hours[(day + 1) % 7];

    if (
      current.isClosed ||
      current.opensAt === null ||
      current.closesAt === null
    ) {
      continue;
    }

    const opening = minutesFromTime(current.opensAt);
    const closing = minutesFromTime(current.closesAt);

    // Si cierra después de medianoche.
    if (closing < opening && !next.isClosed) {
      if (next.opensAt === null) continue;

      const nextOpening = minutesFromTime(next.opensAt);

      if (nextOpening < closing) {
        return fail(
          `El horario del día ${day} se solapa con el día siguiente`,
        );
      }
    }
  }

  return hours;
}

export function validateCompanyPublicInfo(
  input: unknown,
): CompanyPublicInfoInput {
  if (!isRecord(input)) {
    return fail("El cuerpo de la solicitud no es válido");
  }

  if (typeof input.isTemporarilyClosed !== "boolean") {
    return fail(
      "isTemporarilyClosed debe ser booleano",
    );
  }

  return {
    googleMapsUrl: parseGoogleMapsUrl(
      input.googleMapsUrl,
    ),

    isTemporarilyClosed: input.isTemporarilyClosed,

    temporaryClosureReason: parseReason(
      input.temporaryClosureReason,
    ),

    businessHours: parseBusinessHours(
      input.businessHours,
    ),
  };
}