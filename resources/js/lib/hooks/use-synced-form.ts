import { useForm } from "@inertiajs/react";
import { useEffect } from "react";

export function useSyncedForm<T extends Record<string, any>>(initial: T) {
    const form = useForm(initial);

    // Only update form when initial values actually change
    useEffect(() => {
        form.setData(initial);
    }, [JSON.stringify(initial)]);

    return form;
}
