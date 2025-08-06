import { Layout } from "@/components/layouts/app";
import { useAuth } from "@/lib/hooks/useAuth";
import { router } from "@inertiajs/react";

export default function Index() {
    const user = useAuth();

    return (
        <Layout>
            <div className="bg-blue-50">logged in</div>
            <div className="bg-pink-50">{JSON.stringify(user)}</div>
            <button
                className="bg-red-50 cursor-pointer"
                onClick={() => router.post(route("logout"))}
            >
                logout
            </button>
        </Layout>
    );
}
