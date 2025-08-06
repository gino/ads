import { SharedData } from "@/types";
import { usePage } from "@inertiajs/react";
import { useMemo } from "react";

export function useSelectedAdAccount() {
    const { props } = usePage<SharedData>();

    const adAccounts = props.adAccounts;
    const selectedAdAccountId = props.selectedAdAccountId;

    const selectedAdAccount = useMemo(() => {
        return adAccounts.find((account) => account.id === selectedAdAccountId);
    }, [selectedAdAccountId])!;

    return { selectedAdAccountId, selectedAdAccount };
}
