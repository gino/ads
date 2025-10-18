import { Layout } from "@/components/layouts/app-layout";
import { useSelectedAdAccount } from "@/lib/hooks/use-selected-ad-account";
import { router } from "@inertiajs/react";

export default function Settings() {
    const { selectedAdAccount } = useSelectedAdAccount();

    return (
        <Layout title="Settings">
            <div className="flex flex-1 min-h-0 h-full">
                <div className="w-80 p-1 shrink-0">
                    <div className="bg-white shadow-base rounded-xl h-full flex flex-col overflow-y-auto">
                        <div className="p-1.5 flex-1">
                            <div className="space-y-1.5">
                                <button className="font-semibold text-left enabled:active:scale-[0.99] transition-transform duration-100 ease-in-out w-full flex rounded-lg px-3.5 py-2.5 ring-1 ring-transparent text-sm hover:bg-gray-100 hover:ring-gray-100 cursor-pointer items-center gap-3 group">
                                    <span className="flex-1">Account</span>
                                </button>

                                <button className="font-semibold text-left enabled:active:scale-[0.99] transition-transform duration-100 ease-in-out w-full flex rounded-lg px-3.5 py-2.5 ring-1 ring-transparent text-sm hover:bg-gray-100 hover:ring-gray-100 cursor-pointer items-center gap-3 group">
                                    <span className="flex-1">Billing</span>
                                    <span className="font-semibold bg-gray-100 text-[12px] px-2 leading-5 group-enabled:group-hover:bg-gray-200 rounded-full">
                                        Free
                                    </span>
                                </button>

                                <button className="font-semibold text-left enabled:active:scale-[0.99] transition-transform duration-100 ease-in-out w-full flex rounded-lg px-3.5 py-2.5 ring-1 ring-transparent text-sm hover:bg-gray-100 hover:ring-gray-100 cursor-pointer items-center gap-3 group">
                                    <span className="flex-1">Ad accounts</span>
                                </button>

                                <button className="font-semibold text-left enabled:active:scale-[0.99] transition-transform duration-100 ease-in-out w-full flex rounded-lg px-3.5 py-2.5 ring-1 ring-transparent text-sm hover:bg-gray-100 hover:ring-gray-100 cursor-pointer items-center gap-3 group">
                                    <span className="flex-1">
                                        Notifications
                                    </span>
                                </button>
                            </div>
                            <div className="mx-2 my-3">
                                <div className="w-full bg-gray-100 h-px" />
                            </div>
                            <div className="space-y-1.5">
                                <div className="text-xs font-semibold flex items-center px-3.5 py-2.5">
                                    <span className="flex-1 text-gray-400">
                                        {selectedAdAccount.name}
                                    </span>
                                </div>

                                <button className="font-semibold text-left enabled:active:scale-[0.99] transition-transform duration-100 ease-in-out w-full flex rounded-lg px-3.5 py-2.5 ring-1 text-sm bg-gray-100 cursor-pointer items-center gap-3 group ring-gray-100">
                                    <span className="flex-1">Defaults</span>
                                </button>

                                <button className="font-semibold text-left enabled:active:scale-[0.99] transition-transform duration-100 ease-in-out w-full flex rounded-lg px-3.5 py-2.5 ring-1 ring-transparent text-sm hover:bg-gray-100 hover:ring-gray-100 cursor-pointer items-center gap-3 group">
                                    <span className="flex-1">
                                        Advertising identity
                                    </span>
                                </button>

                                <button className="font-semibold text-left enabled:active:scale-[0.99] transition-transform duration-100 ease-in-out w-full flex rounded-lg px-3.5 py-2.5 ring-1 ring-transparent text-sm hover:bg-gray-100 hover:ring-gray-100 cursor-pointer items-center gap-3 group">
                                    <span className="flex-1">Integrations</span>
                                </button>
                            </div>
                            <div className="mx-2 my-3">
                                <div className="w-full bg-gray-100 h-px" />
                            </div>
                            <div className="space-y-1.5">
                                <button className="font-semibold text-left enabled:active:scale-[0.99] transition-transform duration-100 ease-in-out w-full flex rounded-lg px-3.5 py-2.5 ring-1 ring-transparent text-sm hover:bg-gray-100 hover:ring-gray-100 cursor-pointer items-center gap-3 group">
                                    <span className="flex-1">Shortcuts</span>
                                </button>
                                <button
                                    onClick={() => router.post(route("logout"))}
                                    className="font-semibold text-left enabled:active:scale-[0.99] transition-transform duration-100 ease-in-out w-full flex rounded-lg px-3.5 py-2.5 ring-1 ring-transparent text-sm hover:bg-red-900/5 hover:ring-red-900/5 cursor-pointer items-center gap-3 group"
                                >
                                    <span className="text-red-800 flex-1">
                                        Log out
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 p-3 overflow-y-auto">
                    {/* <div>yeet</div> */}
                </div>
            </div>
        </Layout>
    );
}
