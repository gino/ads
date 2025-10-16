import { useSelectedAdAccount } from "@/lib/hooks/use-selected-ad-account";
import { Head } from "@inertiajs/react";
import { PropsWithChildren } from "react";
import { Sidebar } from "../sidebar/sidebar";

interface Props extends PropsWithChildren {
    title: string;
}

export function Layout({ title, children }: Props) {
    const { selectedAdAccount } = useSelectedAdAccount();

    return (
        <div className="flex h-screen">
            <Head title={title} />
            <Sidebar />
            <main className="overflow-hidden flex-1 flex flex-col">
                {/* <div className="bg-red-900 text-xs flex items-center gap-3 px-4 py-4 font-semibold text-white border-b-2 border-[#681315]">
                    <i className="fa-solid fa-exclamation-circle" />
                    <div className="flex-1">
                        Your selected ad account "{selectedAdAccount.name}" must
                        have a beneficiary name set under "Settings" in order to
                        launch ads in the EU
                    </div>
                </div> */}
                {/* <div className="p-5 pb-0">
                    <div className="bg-red-900 text-xs flex items-center gap-3 px-4 py-4 font-semibold text-white rounded-lg ring-1 ring-inset ring-black/5">
                        <i className="fa-solid fa-exclamation-circle text-base" />
                        <div className="flex-1">
                            Your selected ad account "{selectedAdAccount.name}"
                            must have a beneficiary name set under "Settings" in
                            order to launch ads in the EU
                        </div>
                    </div>
                </div> */}

                <div className="p-5 flex-1 min-h-0 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
