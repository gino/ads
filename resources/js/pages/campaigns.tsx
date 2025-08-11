import { Layout } from "@/components/layouts/app-layout";
import { Deferred, router } from "@inertiajs/react";

export default function Campaigns({ adCampaigns }: any) {
    return (
        <Layout title="Campaigns">
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
            <div className="bg-white shadow-base p-6 rounded-xl overflow-auto">
                <pre className="font-sans text-xs">
                    {JSON.stringify(adCampaigns, null, 2)}
                </pre>
            </div>
        </div>
    );
}
