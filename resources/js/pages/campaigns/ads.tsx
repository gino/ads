import { AdsTable } from "@/components/tables/ads-table";
import useDeferred from "@/lib/hooks/use-deferred";
import { Layout } from ".";

interface Props {
    ads: App.Data.AdData[];
}

export default function Ads({ ads }: Props) {
    const { isLoading } = useDeferred({ data: "ads" });

    return (
        <Layout>
            <div>
                <AdsTable isLoading={isLoading} ads={ads} />
            </div>
        </Layout>
    );
}
