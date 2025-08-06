import { SharedData } from "@/types";
import { usePage, usePoll } from "@inertiajs/react";
import { Fragment, PropsWithChildren, useEffect } from "react";

export function Layout({ children }: PropsWithChildren) {
    const { props } = usePage<SharedData>();
    const interval = 3_000;

    const { start, stop } = usePoll(
        interval,
        {
            only: ["adAccounts"],
        },
        { autoStart: false }
    );

    useEffect(() => {
        if (props.adAccounts.length === 0) {
            start();
        } else {
            stop();
        }
    }, [props.adAccounts]);

    const isLoading = props.adAccounts.length === 0;

    return <Fragment>{isLoading ? <LoadingShimmer /> : children}</Fragment>;
}

function LoadingShimmer() {
    return (
        <div className="flex justify-center items-center h-screen bg-white">
            <div className="animate-pulse">
                <i className="text-xl opacity-50 animate-spin fa-solid fa-spinner-third" />
            </div>
        </div>
    );
}
