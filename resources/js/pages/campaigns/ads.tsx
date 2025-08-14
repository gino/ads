import useDeferred from "@/lib/hooks/use-deferred";
import { Layout } from ".";

interface Props {
    ads: App.Data.AdData[];
}

export default function Ads({ ads }: Props) {
    const { isLoading } = useDeferred({ data: "ads" });

    return (
        <Layout>
            <div className="p-6">
                <div>ads</div>

                <pre className="font-sans text-xs">
                    {JSON.stringify(ads, null, 2)}
                </pre>
            </div>
        </Layout>
    );
}
