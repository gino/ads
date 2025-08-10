import { Layout } from "@/components/layouts/app-layout";
import { Deferred, router } from "@inertiajs/react";

export default function Campaigns({ adCampaigns }: any) {
    return (
        <Layout title="Campaigns">
            <h1 className="mb-3 font-semibold">Campaigns</h1>

            <Deferred data="adCampaigns" fallback={<div>Loading...</div>}>
                <CampaignsTable adCampaigns={adCampaigns} />
            </Deferred>

            <button
                className="cursor-pointer mt-3"
                onClick={() => router.post(route("logout"))}
            >
                logout
            </button>
        </Layout>
    );
}

function CampaignsTable({ adCampaigns = [] }: any) {
    return (
        <div>
            {adCampaigns.length === 0 ? (
                <div className="text-sm font-medium text-gray-500">
                    The selected ad account does not have any campaigns.
                </div>
            ) : (
                <div className="bg-white shadow-base p-6 rounded-xl overflow-y-auto min-h-0">
                    <pre className="font-sans text-xs">
                        {JSON.stringify(adCampaigns, null, 2)}
                    </pre>
                </div>
            )}

            {/* {adCampaigns.map((adCampaign: any) => (
                <div className="p-4 mb-4 bg-white rounded-xl shadow-base">
                    <div className="mb-4 font-semibold">
                        {adCampaign.name} ({adCampaign.status}):
                    </div>

                    {adCampaign.ad_sets.map((adSet: any) => (
                        <div className="p-4 space-y-4 bg-white rounded-xl shadow-base">
                            <div className="font-semibold">
                                {adSet.name} ({adSet.status}):
                            </div>

                            {adSet.ads.map((ad: any) => (
                                <div className="p-4 bg-white rounded-xl shadow-base">
                                    <div className="font-semibold">
                                        {ad.name} ({ad.status})
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ))} */}
        </div>
    );
}
