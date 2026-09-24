export interface EventFormClient {
    id: number;
    name: string;
    phone: string;
}

export interface EventFormState {
    clientId: string;

    client?: EventFormClient;

    name: string;

    eventDate: string;

    //   eventTime: string;
    eventStart: string;

    eventEnd: string;

    location: string;

    notes: string;
}

export const initialEventForm: EventFormState = {
    clientId: "",

    client: undefined,

    name: "",

    eventDate: "",
    eventStart: "",
    eventEnd: "",

    //eventTime: "",

    location: "",

    notes: "",
};