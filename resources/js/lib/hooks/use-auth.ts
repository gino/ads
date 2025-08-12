import { SharedData } from "@/types";
import { usePage } from "@inertiajs/react";

export function useAuth() {
    const {
        props: { auth },
    } = usePage<SharedData>();

    return auth.user;
}
