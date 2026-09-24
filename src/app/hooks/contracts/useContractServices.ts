"use client";

import { useEffect, useState } from "react";

export function useContractServices(
    contractId: number
) {

    const [services, setServices] =
        useState<any[]>([]);

    const [companyServices, setCompanyServices] =
        useState<any[]>([]);

    const [contract, setContract] =
        useState<any>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [errorCode, setErrorCode] =
        useState<number>();

    /* ---------------------------------- */
    /* FETCH CONTRACT ITEMS              */
    /* ---------------------------------- */

    async function fetchServices() {

        try {

            setLoading(true);

            const res = await fetch(
                `/api/company/contracts/${contractId}/services`,
                {
                    credentials: "include",
                }
            );

            if (!res.ok) {

                setError(
                    "Failed to fetch services"
                );

                setErrorCode(res.status);

                return;
            }

            const data = await res.json();

            setServices(data);

        } catch {

            setError("Connection error");

        } finally {

            setLoading(false);
        }
    }

    /* ---------------------------------- */
    /* FETCH COMPANY SERVICES             */
    /* ---------------------------------- */

    async function fetchCompanyServices() {

        try {

            const res = await fetch(
                "/api/company/services/active",
                {
                    credentials: "include",
                }
            );

            if (!res.ok) return;

            const data = await res.json();

            setCompanyServices(data);

        } catch {

            setError(
                "Failed to load company services"
            );
        }
    }

    /* ---------------------------------- */
    /* FETCH CONTRACT                     */
    /* ---------------------------------- */

    async function fetchContract() {

        try {

            const res = await fetch(
                `/api/company/contracts/${contractId}`,
                {
                    credentials: "include",
                }
            );

            if (!res.ok) return;

            const data = await res.json();

            setContract(data);

        } catch {

            setError(
                "Failed to load contract"
            );
        }
    }

    /* ---------------------------------- */
    /* CREATE SERVICE                     */
    /* ---------------------------------- */

    async function createService(
        form: any
    ) {

        try {

            setError("");

            const combineDateTime = (
                time?: string
            ) => {

                if (
                    !time ||
                    !contract?.event?.eventDate
                ) {
                    return undefined;
                }

                const date = new Date(
                    contract.event.eventDate
                );

                const [hours, minutes] =
                    time.split(":");

                date.setHours(Number(hours));

                date.setMinutes(
                    Number(minutes)
                );

                date.setSeconds(0);

                return date.toISOString();
            };

            const res = await fetch(
                `/api/company/contracts/${contractId}/services`,
                {
                    method: "POST",
                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        serviceId:
                            Number(form.serviceId),

                        quantity:
                            Number(form.quantity),

                        unitPrice:
                            Number(form.unitPrice),

                        serviceNotes:
                            form.serviceNotes
                            || undefined,

                        operationStart:
                            combineDateTime(
                                form.operationStart
                            ),

                        operationEnd:
                            combineDateTime(
                                form.operationEnd
                            ),
                    }),
                }
            );

            if (!res.ok) {

                const data =
                    await res.json();

                if (data?.error) {

                    setError(data.error);

                } else {

                    setError(
                        "Failed to add service"
                    );
                }

                setErrorCode(res.status);

                return false;
            }

            await fetchServices();

            return true;

        } catch {

            setError("Connection error");

            return false;
        }
    }

    /* ---------------------------------- */
    /* DELETE ITEM                        */
    /* ---------------------------------- */

    async function deleteItem(
        itemId: number
    ) {

        if (
            !confirm(
                "Remove this service?"
            )
        ) {
            return;
        }

        try {

            const res = await fetch(
                `/api/company/contract-items/${itemId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            if (!res.ok) {

                const data =
                    await res.json();

                setError(
                    data?.error ||
                    "Failed to delete item"
                );

                return;
            }

            await fetchServices();

        } catch {

            setError("Connection error");
        }
    }

    /* ---------------------------------- */
    /* UPDATE ITEM                        */
    /* ---------------------------------- */

    async function updateItem(
        itemId: number,
        data: any
    ) {

        try {

            const toISO = (
                value?: any
            ) => {

                if (!value) {
                    return undefined;
                }

                if (
                    typeof value === "string" &&
                    value.includes("T") &&
                    value.includes("Z")
                ) {
                    return value;
                }

                const date = new Date(value);

                if (
                    isNaN(date.getTime())
                ) {
                    return undefined;
                }

                return date.toISOString();
            };

            const res = await fetch(
                `/api/company/contract-items/${itemId}`,
                {
                    method: "PATCH",

                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        ...data,

                        operationStart:
                            toISO(
                                data.operationStart
                            ),

                        operationEnd:
                            toISO(
                                data.operationEnd
                            ),
                    }),
                }
            );

            if (!res.ok) {

                setError(
                    "Failed to update item"
                );

                return;
            }

            await fetchServices();

        } catch {

            setError("Connection error");
        }
    }

    /* ---------------------------------- */
    /* INIT                               */
    /* ---------------------------------- */

    useEffect(() => {

        if (!contractId) return;

        fetchServices();

        fetchCompanyServices();

        fetchContract();

    }, [contractId]);

    return {

        services,
        companyServices,
        contract,

        loading,

        error,
        errorCode,

        setError,

        createService,
        deleteItem,
        updateItem,

        fetchServices,
    };
}