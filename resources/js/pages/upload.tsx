import { Layout } from "@/components/layouts/app-layout";
import { toast } from "@/components/ui/toast";
import { SharedData } from "@/types";
import { usePage } from "@inertiajs/react";

export default function Upload() {
    const { props } = usePage<SharedData>();

    return (
        <Layout title="Upload">
            <div className="bg-white shadow-base p-5 rounded-xl overflow-y-auto max-h-full">
                <button
                    onClick={() => {
                        toast({ contents: "4 ad sets updated" });
                    }}
                    className="cursor-pointer"
                >
                    toast
                </button>
                <pre className="font-sans text-xs">
                    {/* TODO: This is deferred so we want to use loading state */}
                    {JSON.stringify(props.campaigns, null, 2)}
                </pre>
            </div>
        </Layout>
    );
}
