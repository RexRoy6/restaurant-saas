import {
  addServiceToContract,
  getContractServices
} from "@/lib/services/contractItemService"

import {
  createContractItemSchema
} from "@/lib/validations/contractItemValidation"

import { requireAuth } from "@/lib/auth/requireAuth"

/* ---------- POST ---------- */

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()

  try {
    const { id } = await params
    const contractId = Number(id)

    if (Number.isNaN(contractId)) {
      return Response.json(
        { error: "El ID del contrato proporcionado no es válido. Debe ser un número." },
        { status: 400 }
      )
    }

    const body = await req.json()

    const parsed = createContractItemSchema.safeParse(body)

    if (!parsed.success) {
      console.log("❌ ERROR DE VALIDACIÓN ZOD", parsed.error.flatten())
      return Response.json(
        { 
          error: "Los datos enviados no cumplen con el formato requerido.",
          fieldErrors: parsed.error.flatten().fieldErrors 
        },
        { status: 400 }
      )
    }

    const created = await addServiceToContract(
      contractId,
      parsed.data
    )

    return Response.json(created, { status: 201 })

  } catch (error: any) {
    console.error("❌ ERROR EN POST /contract-items:", error.message || error)

    if (error.message === "contract not found") {
      return Response.json(
        { error: "No se encontró el contrato especificado. Es posible que haya sido eliminado." },
        { status: 404 }
      )
    }

    if (error.message === "service not found") {
      return Response.json(
        { error: "El servicio solicitado no existe en el catálogo o está inactivo." },
        { status: 404 }
      )
    }

    // --- INTERCEPTOR DE STOCK AGOTADO DETECTADO ---
    if (error.code === "STOCK_EXCEEDED") {
      const mensajeError = error.available === 0
        ? "Este servicio ya fue agregado al contrato con el máximo de inventario disponible."
        : `Stock insuficiente para este servicio. Solo hay ${error.available} unidades disponibles en inventario.`;

      return Response.json(
        {
          error: mensajeError,
          available: error.available
        },
        { status: 400 }
      )
    }

    return Response.json(
      { error: "Error interno del servidor al intentar agregar el servicio. Por favor, intenta nuevamente." },
      { status: 500 }
    )
  }
}


/* ---------- GET ---------- */

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()

  try {
    const { id } = await params
    const contractId = Number(id)

    // 1. Validación de ID
    if (Number.isNaN(contractId)) {
      return Response.json(
        { error: "El ID del contrato proporcionado no es válido para la búsqueda." },
        { status: 400 }
      )
    }

    // 2. Consulta a Base de Datos
    const items = await getContractServices(contractId)

    return Response.json(items)

  } catch (error) {
    console.error("❌ ERROR EN GET /contract-items:", error)

    return Response.json(
      { error: "Error interno del servidor al cargar los servicios de este contrato." },
      { status: 500 }
    )
  }
}