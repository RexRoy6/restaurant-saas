"use client";

import { useEffect, useState } from "react";

export function useCompanyServices() {

    const [services, setServices] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [errorCode, setErrorCode] =
        useState<number>();


    const fetchServices = async () => {

        try {

            setLoading(true);

            const res = await fetch(
                "/api/company/services",
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
    };


    const createService = async (
        form: any
    ) => {

        try {

            setError("");

            const res = await fetch(
                "/api/company/services",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify(form),
                }
            );

            if (!res.ok) {

                setError(
                    "Failed to create service"
                );

                setErrorCode(res.status);

                return false;
            }

            await fetchServices();

            return true;

        } catch {

            setError("Connection error");

            return false;
        }
    };

    useEffect(() => {

        fetchServices();

    }, []);

    return {

        services,

        loading,

        error,

        errorCode,

        fetchServices,

        createService,
    };
}