import { useSelectedAdAccount } from "@/lib/hooks/useSelectedAdAccount";
import { router } from "@inertiajs/react";
import { useState } from "react";

interface Props {
    adAccounts: App.Data.AdAccountData[];
}

export function AdAccountSelector({ adAccounts }: Props) {
    const { selectedAdAccountId, selectedAdAccount } = useSelectedAdAccount();
    const [selected, setSelected] = useState(selectedAdAccountId);

    return (
        <div className="relative">
            <select
                value={selected}
                title={`${selectedAdAccount.name} (${selectedAdAccount.currency})`}
                onChange={(e) => {
                    setSelected(e.target.value);

                    router.post(
                        "/select-ad-account",
                        {
                            ad_account_id: e.target.value,
                        },
                        {
                            only: ["selectedAdAccountId", "adCampaigns"],
                        }
                    );
                }}
                className="appearance-none cursor-pointer outline-none w-full rounded-lg pl-11 pr-20 truncate py-2.5 font-semibold shadow-base text-sm"
            >
                {adAccounts.map((adAccount) => (
                    <option key={adAccount.id} value={adAccount.id}>
                        {adAccount.name}
                    </option>
                ))}
            </select>

            <div className="flex absolute right-3 top-1/2 gap-2 items-center text-xs -translate-y-1/2 pointer-events-none">
                <span className="font-semibold bg-gray-100 text-[12px] px-2 leading-5 rounded-full text-gray-800">
                    {selectedAdAccount.currency}
                </span>
                <i className="fa-solid fa-angle-down text-gray-400" />
            </div>

            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <div className="flex justify-center items-center w-6 h-6 text-[12px] font-bold bg-blue-600/5 rounded text-blue-950">
                    {selectedAdAccount.name[0].toUpperCase()}
                </div>
            </div>
        </div>
    );
}
