"use client";

import ListCard from
"@/app/components/crm/ListCard";

export default function ServiceCard({
    service,
}: {
    service: any;
}) {

    const isActive =
        !service.deletedAt;

    return (

        <ListCard
            title={service.name}
            subtitle={service.description}
            link={`/company/service/${service.id}`}
            isActive={isActive}
            content={

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        marginTop: 6,
                        fontSize: 13,
                    }}
                >

                    <span>
                        <strong>Stock:</strong>
                        {" "}
                        {service.stockTotal}
                    </span>

                    <span>
                        <strong>Price:</strong>
                        {" "}
                        ${service.priceBase}
                    </span>

                </div>
            }
        />
    );
}