import { Layout } from "@/components/layouts/app-layout";
import { router } from "@inertiajs/react";

export default function Index() {
    return (
        <Layout title="Dashboard">
            <button
                className="cursor-pointer"
                onClick={() => router.post(route("logout"))}
            >
                logout
            </button>
        </Layout>
    );
}
