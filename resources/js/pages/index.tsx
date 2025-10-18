import { Layout } from "@/components/layouts/app-layout";
import { useAuth } from "@/lib/hooks/use-auth";
import { SharedData } from "@/types";
import { router, usePage } from "@inertiajs/react";

export default function Index() {
    const user = useAuth();

    const { props } = usePage<SharedData>();

    return (
        <Layout title="Dashboard">
            <div className="p-3 h-full overflow-y-auto">
                <div className="bg-white shadow-base p-5 rounded-xl">
                    <pre className="font-sans text-xs">
                        {JSON.stringify(
                            { user, adAccounts: props.adAccounts },
                            null,
                            2
                        )}
                    </pre>
                    <button
                        className="cursor-pointer"
                        onClick={() => router.post(route("logout"))}
                    >
                        logout
                    </button>
                </div>
            </div>
        </Layout>
    );
}
