import { Layout } from "@/components/layouts/settings-layout";
import { SettingsHeader } from "@/components/settings/settings-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/hooks/use-auth";
import { format } from "date-fns";

export default function Account() {
    const user = useAuth();

    return (
        <Layout title="Account">
            <div className="p-3">
                <div className="max-w-3xl mx-auto">
                    <div className="p-1 bg-gray-100 rounded-2xl ring-gray-200/30 ring-inset ring-1">
                        <div className="bg-white rounded-xl shadow-base divide-y divide-gray-100">
                            <div className="px-5 py-4 flex items-center">
                                <SettingsHeader>Account</SettingsHeader>
                            </div>
                            <div className="p-5">
                                <label>
                                    <span className="block mb-2 font-semibold">
                                        Identifier
                                    </span>
                                    <Input
                                        type="text"
                                        value={user.id}
                                        disabled
                                    />
                                    <div className="text-xs font-medium mt-2 text-gray-500">
                                        When contacting support, please provide
                                        this account identifier to ensure quick
                                        assistance.
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
                                        value={user.name}
                                        disabled
                                    />
                                </label>

                                <label>
                                    <span className="block mb-2 font-semibold">
                                        Email address
                                    </span>
                                    <Input
                                        type="email"
                                        value={user.email}
                                        disabled
                                    />
                                </label>
                            </div>
                            <div className="p-5">
                                <label>
                                    <span className="block mb-2 font-semibold">
                                        Account since
                                    </span>
                                    <Input
                                        type="text"
                                        value={format(
                                            user.createdAt,
                                            "MMMM d, yyyy"
                                        )}
                                        disabled
                                    />
                                </label>
                            </div>
                            <div className="p-5 flex items-center justify-between gap-5">
                                <div>
                                    <div className="font-semibold mb-1">
                                        Account deletion
                                    </div>
                                    <div className="text-xs font-medium text-gray-500 leading-relaxed">
                                        All of your account data will be
                                        permanently deleted and this action is
                                        irreversible.
                                    </div>
                                </div>
                                <div className="whitespace-nowrap">
                                    <Button className="text-red-800">
                                        Delete my account
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
