export const parseLocalDate = (
  value: string | Date
) => {
  if (value instanceof Date) {
    return new Date(value);
  }

  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    const [y, m, d] = value.split("-").map(Number);

    return new Date(y, m - 1, d);
  }

  return new Date(value);
};

export const replaceDateKeepTime = (
  newDate: string,
  originalDateTime?: string | Date
) => {
  if (!newDate || !originalDateTime) {
    return undefined;
  }

  const baseDate = parseLocalDate(newDate);
  const original = new Date(originalDateTime);

  if (
    isNaN(baseDate.getTime()) ||
    isNaN(original.getTime())
  ) {
    return undefined;
  }

  baseDate.setHours(
    original.getHours(),
    original.getMinutes(),
    original.getSeconds(),
    original.getMilliseconds()
  );

  return baseDate.toISOString();
};


export const formatDate = (
  value: string | Date
) => {

  // let date: Date;

  // if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
  //   const [y, m, d] = value.split("-").map(Number);

  //   date = new Date(y, m - 1, d);
  // } else {
  //   date = new Date(value);
  // }


  const date = parseLocalDate(value);

  if (isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export const formatTime = (
  value: string | Date
) => {

  const date = new Date(value)

  if (isNaN(date.getTime())) {
    return ""
  }

  return date.toLocaleTimeString(
    "es-MX",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  )
}

export const formatDateTime = (
  value: string | Date
) => {
  return `${formatDate(value)} ${formatTime(value)}`;
};

export const toISODate = (
  value?: string | Date
) => {
  if (!value) return undefined;

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
};
export const toISOTime = (
  value?: string | Date
) => {
  if (!value) return undefined;

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString().split("T")[1];
};
export const toLocalInput = (
  iso?: string | Date
) => {
  if (!iso) return "";

  const date = new Date(iso);

  if (isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();

  const local = new Date(
    date.getTime() - offset * 60000
  );

  return local.toISOString().slice(0, 16);
};

export const combineDateTime = (
  baseDate?: string | Date,
  time?: string
) => {
  if (!baseDate || !time) return;

  // let date: Date;

  // if (
  //   typeof baseDate === "string" &&
  //   /^\d{4}-\d{2}-\d{2}$/.test(baseDate)
  // ) {
  //   const [y, m, d] = baseDate
  //     .split("-")
  //     .map(Number);

  //   date = new Date(y, m - 1, d);
  // } else {
  //   date = new Date(baseDate);
  // }

  const date = parseLocalDate(baseDate);

  const [hours, minutes] =
    time.split(":").map(Number);

  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date.toISOString();
};