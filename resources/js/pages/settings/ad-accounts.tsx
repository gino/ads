import { Layout } from "@/components/layouts/settings-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { router } from "@inertiajs/react";
import { formatDistanceToNowStrict } from "date-fns";
import { useMemo } from "react";

interface Props {
    adAccounts: App.Data.AdAccountData[];
}

export default function AdAccounts({ adAccounts }: Props) {
    const sortedAdAccounts = useMemo(() => {
        return adAccounts.sort(
            (a, b) => Number(b.isActive) - Number(a.isActive)
        );
    }, [adAccounts]);

    return (
        <Layout title="Ad accounts">
            <div className="p-3">
                <div className="max-w-3xl mx-auto">
                    <div className="p-1 bg-gray-100 rounded-2xl ring-gray-200/30 ring-inset ring-1">
                        <div className="bg-white rounded-xl shadow-base divide-y divide-gray-100">
                            <div className="px-5 py-4 flex items-center">
                                <div className="font-semibold flex-1">
                                    Ad accounts ({adAccounts.length})
                                </div>
                            </div>
                            <div className="p-5">
                                <table className="w-full rounded-lg ring ring-gray-200">
                                    <tbody className="divide-y divide-gray-200">
                                        {sortedAdAccounts.map((adAccount) => (
                                            <tr
                                                key={adAccount.id}
                                                className={cn(
                                                    !adAccount.isActive &&
                                                        "opacity-50"
                                                )}
                                            >
                                                <td className="px-5 py-4.5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-[16px] self-start">
                                                            {adAccount.isActive ? (
                                                                <i className="fa-brands fa-meta text-[12px] text-[#0081FB] fa-fw" />
                                                            ) : (
                                                                <i className="fa-solid fa-triangle-exclamation text-red-800 text-xs fa-fw mt-1" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div>
                                                                <div className="font-semibold mb-px">
                                                                    {
                                                                        adAccount.name
                                                                    }
                                                                </div>
                                                                <div className="text-[12px] font-medium text-gray-500">
                                                                    ID:{" "}
                                                                    {adAccount.externalId.replace(
                                                                        "act_",
                                                                        ""
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4.5">
                                                    {adAccount.isActive && (
                                                        <i className="fa-solid fa-check-circle text-emerald-700 text-base" />
                                                    )}
                                                </td>
                                                <td className="px-5 py-4.5">
                                                    <div className="flex justify-end">
                                                        <div className="font-semibold bg-gray-100 text-[12px] px-2 leading-5 rounded-full">
                                                            {adAccount.currency}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4.5">
                                                    <div className="text-right">
                                                        <div className="text-[12px] font-semibold text-gray-500 mb-px">
                                                            Timezone
                                                        </div>
                                                        <div className="font-semibold text-xs">
                                                            {adAccount.timezone}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4.5">
                                                    <div className="text-right">
                                                        <div className="text-[12px] font-semibold text-gray-500 mb-px">
                                                            Since
                                                        </div>
                                                        <div className="font-semibold text-xs">
                                                            {formatDistanceToNowStrict(
                                                                adAccount.createdAt,
                                                                {
                                                                    addSuffix:
                                                                        true,
                                                                }
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="flex justify-end mt-5 items-center gap-2">
                                    <Button
                                        onClick={() => {
                                            router.get(route("reauthenticate"));
                                        }}
                                    >
                                        Refresh accounts
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            router.get(route("reauthenticate"));
                                        }}
                                        variant="primary"
                                    >
                                        Re-authenticate
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
