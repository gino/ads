import { Layout, useSelectedCampaigns } from ".";

export default function AdSets() {
    const [selectedCampaigns] = useSelectedCampaigns();

    return (
        <Layout>
            <div className="p-6">
                <div>adsets</div>
                <div>{JSON.stringify(selectedCampaigns)}</div>
            </div>
        </Layout>
    );
}
