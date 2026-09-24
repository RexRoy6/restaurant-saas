import {
    getCompanyService,
    updateService,
    deleteService,
    reactivateService
} from "@/lib/services/serviceService"
import {
    updateServiceSchema
} from "@/lib/validations/serviceValidation"

import { requireAuth } from "@/lib/auth/requireAuth"

/* ---------- GET ---------- */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireAuth()
    try {
        const { id } = await params
        const serviceId = Number(id)

        if (Number.isNaN(serviceId)) {
            return Response.json(
                { error: "invalid service id" },
                { status: 400 }
            )
        }

        const data = await getCompanyService(serviceId)

        if (!data) {
            return Response.json(
                { error: "service not found" },
                { status: 404 }
            )
        }

        return Response.json(data)

    } catch (error) {
        console.error(error)
        return Response.json(
            { error: "internal server error" },
            { status: 500 }
        )
    }
}


/* ---------- PATCH (update or reactivate) ---------- */
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireAuth()
    try {
        const { id } = await params
        const serviceId = Number(id)

        if (Number.isNaN(serviceId)) {
            return Response.json(
                { error: "invalid service id" },
                { status: 400 }
            )
        }

        /* check if this is reactivation */
        const { searchParams } = new URL(req.url)
        const reactivate = searchParams.get("reactivate")

        if (reactivate === "true") {
            const result = await reactivateService(serviceId)

            if (!result) {
                return Response.json(
                    { error: "service not found" },
                    { status: 404 }
                )
            }

            return Response.json({ message: "service reactivated" })
        }

        /* ---------- normal update ---------- */
        const body = await req.json()

        const parsed = updateServiceSchema.safeParse(body)

        if (!parsed.success) {
            return Response.json(
                { error: parsed.error.flatten() },
                { status: 400 }
            )
        }

        const updated = await updateService(
            serviceId,
            parsed.data
        )

        if (!updated) {
            return Response.json(
                { error: "service not found" },
                { status: 404 }
            )
        }

        return Response.json(updated)

    } catch (error: any) {
        console.error(error)

        if (
            error?.cause?.code === "ER_DUP_ENTRY" ||
            error?.code === "ER_DUP_ENTRY"
        ) {
            return Response.json(
                { error: "Service with this name already exists" },
                { status: 409 }
            )
        }

        return Response.json(
            { error: "internal server error" },
            { status: 500 }
        )
    }
}


/* ---------- DELETE (soft delete) ---------- */
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireAuth()
    try {
        const { id } = await params
        const serviceId = Number(id)

        if (Number.isNaN(serviceId)) {
            return Response.json(
                { error: "invalid service id" },
                { status: 400 }
            )
        }

        const result = await deleteService(serviceId)

        if (!result) {
            return Response.json(
                { error: "service not found" },
                { status: 404 }
            )
        }

        return Response.json({
            message: "service deleted"
        })

    } catch (error) {
        console.error(error)
        return Response.json(
            { error: "internal server error" },
            { status: 500 }
        )
    }
}