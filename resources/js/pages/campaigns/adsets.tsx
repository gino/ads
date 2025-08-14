import { AdSetsTable } from "@/components/tables/adsets-table";
import useDeferred from "@/lib/hooks/use-deferred";
import { Layout } from ".";

interface Props {
    adSets: App.Data.AdSetData[];
}

export default function AdSets({ adSets }: Props) {
    const { isLoading } = useDeferred({ data: "adSets" });

    return (
        <Layout>
            <div>
                <AdSetsTable isLoading={isLoading} adSets={adSets} />
            </div>
        </Layout>
    );
}
