import { Layout } from "@/components/layouts/app-layout";

export default function Settings() {
    return (
        <Layout title="Settings">
            <div className="flex flex-1 min-h-0 h-full">
                <div className="w-80 p-1 shrink-0">
                    <div className="bg-white shadow-base rounded-xl h-full flex flex-col overflow-y-auto">
                        <div className="p-1.5 flex-1">
                            <div className="space-y-1.5">
                                <button className="font-semibold w-full flex rounded-lg px-3.5 py-2.5 ring-1 ring-transparent text-sm hover:bg-gray-100 hover:ring-gray-100 cursor-pointer items-center gap-3 group">
                                    <span>Account</span>
                                </button>

                                <button className="font-semibold w-full flex rounded-lg px-3.5 py-2.5 ring-1 ring-transparent text-sm hover:bg-gray-100 hover:ring-gray-100 cursor-pointer items-center gap-3 group">
                                    <span>Billing</span>
                                </button>
                            </div>
                            <div className="mx-3.5 my-3">
                                <div className="w-full bg-gray-100 h-px" />
                            </div>
                            <div className="space-y-1.5">
                                <button className="font-semibold w-full flex rounded-lg px-3.5 py-2.5 ring-1 ring-transparent text-sm hover:bg-gray-100 hover:ring-gray-100 cursor-pointer items-center gap-3 group">
                                    <span>Ad accounts</span>
                                </button>
                                <button className="font-semibold w-full flex rounded-lg px-3.5 py-2.5 ring-1 text-sm bg-gray-100 cursor-pointer items-center gap-3 group ring-gray-100">
                                    <span>Defaults</span>
                                </button>

                                <button className="font-semibold w-full flex rounded-lg px-3.5 py-2.5 ring-1 ring-transparent text-sm hover:bg-gray-100 hover:ring-gray-100 cursor-pointer items-center gap-3 group">
                                    <span>Advertising identity</span>
                                </button>

                                <button className="font-semibold w-full flex rounded-lg px-3.5 py-2.5 ring-1 ring-transparent text-sm hover:bg-gray-100 hover:ring-gray-100 cursor-pointer items-center gap-3 group">
                                    <span>Integrations</span>
                                </button>
                            </div>
                            <div className="mx-3.5 my-3">
                                <div className="w-full bg-gray-100 h-px" />
                            </div>
                            <div className="space-y-1.5">
                                <button className="font-semibold w-full flex rounded-lg px-3.5 py-2.5 ring-1 ring-transparent text-sm hover:bg-gray-100 hover:ring-gray-100 cursor-pointer items-center gap-3 group">
                                    <span>Shortcuts</span>
                                </button>
                                <button className="font-semibold w-full flex rounded-lg px-3.5 py-2.5 ring-1 ring-transparent text-sm hover:bg-gray-100 hover:ring-gray-100 cursor-pointer items-center gap-3 group">
                                    <span className="text-red-800">
                                        Log out
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 p-3 overflow-y-auto">
                    <div>yeet</div>
                </div>
            </div>
        </Layout>
    );
}
