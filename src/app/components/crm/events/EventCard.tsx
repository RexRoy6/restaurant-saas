"use client";

import ListCard from "@/app/components/crm/ListCard";

import { useRouter } from "next/navigation";

import {
  formatDate,
  formatTime,
} from "@/lib/utils/date";

import type {
  EventListItem,
} from "@/types/event";

interface Props {
  event: EventListItem;
}

export default function EventCard({
  event,
}: Props) {

  const router = useRouter();

  const contract = event.contract;

  return (
    <ListCard
      title={event.name}

      subtitle={event.client.name}

      content={
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            marginTop: 6,
          }}
        >

          {/* DATE */}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: "var(--text-secondary)",
              }}
            >
              Date
            </span>

            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text-primary)",
              }}
            >
              {formatDate(event.eventDate)}
              {" · "}
              {formatTime(event.eventStart)}
              {" - "}
              {formatTime(event.eventEnd)}
            </span>
          </div>

          {/* LOCATION */}

          {event.location && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "var(--text-secondary)",
                }}
              >
                Location
              </span>

              <span
                style={{
                  fontSize: 13,
                  color: "var(--text-primary)",
                }}
              >
                {event.location}
              </span>
            </div>
          )}

          {/* NOTES */}

          {event.notes && (
            <div
              style={{
                marginTop: 4,
                padding: "8px 10px",
                background: "var(--bg-secondary)",
                borderRadius: 8,
                border:
                  "1px solid var(--bg-secondary)",
                fontSize: 12,
                color: "var(--text-primary)",
              }}
            >
              {event.notes}
            </div>
          )}
        </div>
      }

      actions={[
        ...(contract
          ? [
            {
              label: "View Contract",

              onClick: () =>
                router.push(
                  `/company/contracts/${contract.id}/services`
                ),
            },
          ]
          : []),

        {
          label: "Manage →",

          onClick: () =>
            router.push(
              `/company/clients/${event.client.id}/events/${event.id}`
            ),
        },
      ]}
    />
  );
}