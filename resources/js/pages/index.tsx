import { Sidebar } from "@/components/sidebar/sidebar";
import { SharedData } from "@/types";
import { router, usePage } from "@inertiajs/react";

export default function Index({ adCampaigns }: any) {
    const { props } = usePage<SharedData>();

    return (
        <div className="flex h-screen">
            <Sidebar adAccounts={props.adAccounts} />
            <main className="overflow-y-auto flex-1 p-6 min-h-0">
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
                    className="cursor-pointer mt-3"
                    onClick={() => router.post(route("logout"))}
                >
                    logout
                </button>
            </main>
        </div>
    );
}
