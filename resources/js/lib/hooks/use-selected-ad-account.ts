import { toast } from "@/components/ui/toast";
import { SharedData } from "@/types";
import { router, usePage } from "@inertiajs/react";
import { useCallback, useMemo } from "react";

export function useSelectedAdAccount() {
    const { props } = usePage<SharedData>();

    const adAccounts = props.adAccounts;
    const selectedAdAccountId = props.selectedAdAccountId;

    const selectedAdAccount = useMemo(() => {
        return adAccounts.find((account) => account.id === selectedAdAccountId);
    }, [selectedAdAccountId])!;

    const selectAdAccount = useCallback((id: string) => {
        router.post(
            route("select-ad-account"),
            { ad_account_id: id },
            {
                //     only: ["selectedAdAccountId", "adCampaigns"],
                replace: true,
                onSuccess: () => {
                    toast({ contents: "Ad account updated" });
                },
            }
        );
    }, []);

    return { selectedAdAccountId, selectedAdAccount, selectAdAccount };
}
