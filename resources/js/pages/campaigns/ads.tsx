import { Layout, useSelectedCampaigns } from ".";

export default function Ads() {
    const [selectedCampaigns] = useSelectedCampaigns();

    return (
        <Layout>
            <div className="p-6">
                <div>ads</div>
                <div>{JSON.stringify(selectedCampaigns)}</div>
            </div>
        </Layout>
    );
}
