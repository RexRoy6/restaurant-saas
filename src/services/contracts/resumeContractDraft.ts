export async function resumeContractDraft(eventId: number) {
  // 1. Buscamos si existe CUALQUIER contrato para este evento (quitamos &status=draft)
  const res = await fetch(
    `/api/company/contracts?eventId=${eventId}`,
    {
      credentials: "include",
    },
  );

  if (!res.ok) {
    throw new Error("Error al consultar la base de datos de contratos.");
  }

  const data = await res.json();

  // 2. Si ya existe un contrato asignado a este evento
  if (data.data?.length > 0) {
    const existingContract = data.data[0];

    // Validamos: Si ya no es un borrador, bloqueamos el acceso al Registro Rápido
    if (existingContract.status !== "draft") {
      throw new Error("Este evento ya tiene un contrato activo o finalizado. No se puede modificar desde el Registro Rápido.");
    }

    // Si sigue siendo borrador, lo retomamos
    return {
      contract: existingContract,
      created: false,
    };
  }

  // 3. Solo si no existe NINGÚN contrato, intentamos crear un borrador nuevo
  const createRes = await fetch("/api/company/contracts", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      eventId,
      status: "draft",
      totalAmount: 0,
    }),
  });

  if (!createRes.ok) {
    throw new Error("Error al inicializar un nuevo borrador de contrato.");
  }

  const contract = await createRes.json();

  return {
    contract,
    created: true,
  };
}