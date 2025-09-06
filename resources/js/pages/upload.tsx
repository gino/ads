import { Layout } from "@/components/layouts/app-layout";
import { SharedData } from "@/types";
import { usePage } from "@inertiajs/react";

export default function Upload() {
    const { props } = usePage<SharedData>();

    return (
        <Layout title="Dashboard">
            <div className="bg-white shadow-base p-5 rounded-xl overflow-y-auto max-h-full">
                <pre className="font-sans text-xs">
                    {JSON.stringify(props.campaigns, null, 2)}
                </pre>
            </div>
        </Layout>
    );
}
