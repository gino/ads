import { Layout } from "@/components/layouts/app-layout";

export default function Settings() {
    return (
        <Layout title="Settings">
            <div className="flex min-h-full gap-3">
                <div className="w-80 self-stretch -mx-2 -my-2 mr-0">
                    <div className="bg-white shadow-base rounded-xl h-full">
                        <div className="p-1.5">
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
                                <button className="font-semibold w-full flex rounded-lg px-3.5 py-2.5 ring-1 text-sm bg-gray-100 cursor-pointer items-center gap-3 group ring-gray-100">
                                    <span>Defaults</span>
                                </button>

                                <button className="font-semibold w-full flex rounded-lg px-3.5 py-2.5 ring-1 ring-transparent text-sm hover:bg-gray-100 hover:ring-gray-100 cursor-pointer items-center gap-3 group">
                                    <span>Advertising identity</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-1">
                    <div className="max-w-3xl mx-auto w-full">
                        <div className="">yeet</div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
