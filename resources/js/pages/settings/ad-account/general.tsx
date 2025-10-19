import { Layout } from "@/components/layouts/settings-layout";
import { Input } from "@/components/ui/input";
import { useSelectedAdAccount } from "@/lib/hooks/use-selected-ad-account";
import { format } from "date-fns";

export default function General() {
    const { selectedAdAccount } = useSelectedAdAccount();

    return (
        <Layout title={`General / ${selectedAdAccount.name}`}>
            <div className="p-3">
                <div className="max-w-3xl mx-auto">
                    <div className="p-1 bg-gray-100 rounded-2xl ring-gray-200/30 ring-inset ring-1">
                        <div className="bg-white rounded-xl shadow-base divide-y divide-gray-100">
                            <div className="px-5 py-4 flex items-center">
                                <div className="font-semibold flex-1">
                                    General / {selectedAdAccount.name}
                                </div>
                                <div>
                                    <div className="font-semibold bg-gray-100 text-[12px] px-2 leading-5 group-hover:bg-gray-200 rounded-full">
                                        {selectedAdAccount.currency}
                                    </div>
                                </div>
                            </div>
                            <div className="p-5">
                                <label>
                                    <span className="block mb-2 font-semibold">
                                        Identifier
                                    </span>
                                    <Input
                                        type="text"
                                        value={selectedAdAccount.id}
                                        disabled
                                    />
                                    <div className="text-xs font-medium mt-2 text-gray-500">
                                        When contacting support, please provide
                                        this ad account identifier to ensure
                                        quick assistance.
                                    </div>
                                </label>
                            </div>
                            <div className="p-5 grid grid-cols-2 gap-2.5">
                                <label>
                                    <span className="block mb-2 font-semibold">
                                        Name
                                    </span>
                                    <Input
                                        type="text"
                                        value={selectedAdAccount.name}
                                        disabled
                                    />
                                </label>

                                <label>
                                    <span className="block mb-2 font-semibold">
                                        External ID
                                    </span>
                                    <Input
                                        type="text"
                                        value={selectedAdAccount.externalId.replace(
                                            "act_",
                                            ""
                                        )}
                                        disabled
                                    />
                                </label>
                            </div>
                            <div className="p-5">
                                <label>
                                    <span className="block mb-2 font-semibold">
                                        Timezone
                                    </span>
                                    <Input
                                        type="text"
                                        value={selectedAdAccount.timezone}
                                        disabled
                                    />
                                </label>
                            </div>
                            <div className="p-5">
                                <label>
                                    <span className="block mb-2 font-semibold">
                                        Connected since
                                    </span>
                                    <Input
                                        type="text"
                                        value={format(
                                            selectedAdAccount.createdAt,
                                            "MMMM d, yyyy"
                                        )}
                                        disabled
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
