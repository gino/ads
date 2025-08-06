import { SharedData } from "@/types";
import { router, usePage, usePoll } from "@inertiajs/react";
import { useEffect } from "react";

export default function Loading() {
    const { props } = usePage<SharedData>();
    const interval = 3_000; // 3 seconds

    usePoll(interval, {
        only: ["last_synced"],
    });

    useEffect(() => {
        if (props.last_synced !== null) {
            router.push({
                url: "/",
            });
            return;
        }
    }, [props.last_synced]);

    return <div>loading...</div>;
}
