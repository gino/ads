import { useAuth } from "@/lib/hooks/useAuth";
import { useSelectedAdAccount } from "@/lib/hooks/useSelectedAdAccount";
import { SharedData } from "@/types";
import { router, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function Index({ adCampaigns }: any) {
    const user = useAuth();

    const { props } = usePage<SharedData>();

    const { selectedAdAccountId, selectedAdAccount } = useSelectedAdAccount();

    const [selected, setSelected] = useState(selectedAdAccountId);

    return (
        <div className="flex h-screen">
            <aside className="flex overflow-y-auto flex-col p-3 w-72 min-h-0 border-r border-neutral-100">
                <div className="flex-1">
                    <div className="mb-4">
                        <div className="relative">
                            <select
                                value={selected}
                                onChange={(e) => {
                                    setSelected(e.target.value);

                                    router.post(
                                        "/select-ad-account",
                                        {
                                            ad_account_id: e.target.value,
                                        },
                                        {
                                            only: [
                                                "selectedAdAccountId",
                                                "adCampaigns",
                                            ],
                                        }
                                    );
                                }}
                                className="appearance-none outline-none w-full rounded-lg pl-11 pr-9 truncate py-2.5 font-semibold shadow-base text-sm"
                            >
                                {props.adAccounts.map((adAccount) => (
                                    <option
                                        key={adAccount.id}
                                        value={adAccount.id}
                                    >
                                        {adAccount.name}
                                    </option>
                                ))}
                            </select>

                            <div className="flex absolute right-3 top-1/2 gap-2 items-center text-xs -translate-y-1/2 pointer-events-none">
                                <span className="font-semibold bg-neutral-100 text-[12px] px-2 leading-5 rounded-full text-neutral-800">
                                    {selectedAdAccount.currency}
                                </span>
                                <i className="fa-solid fa-angle-down text-neutral-500" />
                            </div>

                            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                <div className="flex justify-center items-center w-6 h-6 text-[12px] font-bold bg-blue-50 rounded text-blue-950">
                                    {selectedAdAccount.name[0].toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <button className="px-3 cursor-pointer py-2.5 flex rounded-lg group w-full items-center gap-3 font-semibold bg-neutral-100 ring-1 ring-neutral-100">
                            <i className="text-base fa-regular fa-grid-2 fa-fw" />
                            <span>Dashboard</span>
                        </button>

                        <button className="px-3 cursor-pointer py-2.5 flex rounded-lg group w-full items-center gap-3 font-semibold hover:bg-neutral-100 hover:ring-1 ring-neutral-100">
                            <i className="text-base fa-regular fa-arrow-up-from-bracket fa-fw text-neutral-400 group-hover:text-black" />
                            <span className="text-neutral-600 group-hover:text-black">
                                Upload
                            </span>
                        </button>

                        <button className="px-3 cursor-pointer py-2.5 flex rounded-lg group w-full items-center gap-3 font-semibold hover:bg-neutral-100 hover:ring-1 ring-neutral-100">
                            <i className="text-base fa-regular fa-list fa-fw text-neutral-400 group-hover:text-black" />
                            <span className="text-neutral-600 group-hover:text-black">
                                Campaigns
                            </span>
                        </button>

                        <button className="px-3 cursor-pointer py-2.5 flex rounded-lg group w-full items-center gap-3 font-semibold hover:bg-neutral-100 hover:ring-1 ring-neutral-100">
                            <i className="text-base fa-regular fa-cog fa-fw text-neutral-400 group-hover:text-black" />
                            <span className="text-neutral-600 group-hover:text-black">
                                Settings
                            </span>
                        </button>
                    </div>
                </div>
                <div>
                    <button className="flex gap-3 items-center px-3 py-2.5 w-full text-left rounded-lg ring-1 ring-neutral-100">
                        <img
                            src={user.avatar}
                            className="object-cover object-center w-8 h-8 rounded-full"
                        />
                        <div>
                            <div className="text-sm font-semibold">
                                {user.name}
                            </div>
                            <div className="text-xs font-medium text-neutral-500">
                                {user.email}
                            </div>
                        </div>
                    </button>
                </div>
            </aside>
            <main className="overflow-y-auto flex-1 p-6 min-h-0 bg-neutral-50/50">
                <h1 className="mb-3 font-semibold">Campaigns</h1>

                <div>
                    {adCampaigns.length === 0 && (
                        <div className="text-sm font-medium text-neutral-500">
                            The selected ad account does not have any campaigns.
                        </div>
                    )}

                    {adCampaigns.map((adCampaign: any) => (
                        <div className="p-4 mb-4 bg-white rounded-xl border border-neutral-100">
                            <div className="mb-4 font-semibold">
                                {adCampaign.name} ({adCampaign.status}):
                            </div>

                            {adCampaign.ad_sets.map((adSet: any) => (
                                <div className="p-4 space-y-4 bg-white rounded-xl border border-neutral-100">
                                    <div className="font-semibold">
                                        {adSet.name} ({adSet.status}):
                                    </div>

                                    {adSet.ads.map((ad: any) => (
                                        <div className="p-4 bg-white rounded-xl border border-neutral-100">
                                            <div className="font-semibold">
                                                {ad.name} ({ad.status})
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                <button
                    className="cursor-pointer"
                    onClick={() => router.post(route("logout"))}
                >
                    logout
                </button>
            </main>
        </div>
    );
}
