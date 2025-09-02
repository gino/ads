import { Layout } from "@/components/layouts/app-layout";
import { Deferred, usePage } from "@inertiajs/react";
import axios from "axios";

export default function Test() {
    return (
        <Layout title="Test">
            <Deferred
                data="test"
                fallback={<div className="bg-purple-300">loading...</div>}
            >
                <Yeet />
            </Deferred>
        </Layout>
    );
}

function Yeet() {
    const { props } = usePage();

    return (
        <div>
            <pre className="font-sans text-xs">
                {JSON.stringify(props.test, null, 2)}
            </pre>

            <button
                onClick={() => {
                    // router.post("/test/update", undefined, {
                    //     only: [],
                    //     preserveState: true,
                    // });

                    axios.post("/test/update");
                }}
                className="bg-red-500"
            >
                update
            </button>
        </div>
    );
}
