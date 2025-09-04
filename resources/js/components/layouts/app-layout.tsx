import { Head } from "@inertiajs/react";
import { PropsWithChildren } from "react";
import { Sidebar } from "../sidebar/sidebar";

interface Props extends PropsWithChildren {
    title: string;
}

export function Layout({ title, children }: Props) {
    return (
        <div className="flex h-screen">
            <Head title={title} />
            <Sidebar />
            <main className="overflow-y-auto flex-1 min-h-0 p-5">
                {children}
            </main>
        </div>
    );
}
