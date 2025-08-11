import { Layout } from "@/components/layouts/app-layout";
import { useAuth } from "@/lib/hooks/useAuth";
import { SharedData } from "@/types";
import { router, usePage } from "@inertiajs/react";

export default function Index() {
    const user = useAuth();

    const { props } = usePage<SharedData>();

    return (
        <Layout title="Dashboard">
            <div className="bg-white shadow-base p-6 rounded-xl overflow-auto">
                <pre className="font-sans text-xs">
                    {JSON.stringify(
                        { user, adAccounts: props.adAccounts },
                        null,
                        2
                    )}
                </pre>
            </div>

            <button
                className="cursor-pointer"
                onClick={() => router.post(route("logout"))}
            >
                logout
            </button>
        </Layout>
    );
}
