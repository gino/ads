import { Layout } from "@/components/layouts/settings-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSyncedForm } from "@/lib/hooks/use-synced-form";
import { useMemo } from "react";

interface Props {
    dsaPayor: string | null;
    dsaBeneficiary: string | null;
}

export default function AdvertisingIdentity({
    dsaPayor,
    dsaBeneficiary,
}: Props) {
    const form = useSyncedForm({
        dsaPayor: dsaPayor ?? "",
        dsaBeneficiary: dsaBeneficiary ?? "",
    });

    const isDisabled = useMemo(() => {
        if (!form.isDirty) {
            return true;
        }

        return !(form.data.dsaBeneficiary && form.data.dsaPayor);
    }, [form.isDirty, form.data.dsaPayor, form.data.dsaBeneficiary]);

    return (
        <Layout title="Advertising identity">
            <div className="p-3">
                <div className="max-w-3xl mx-auto">
                    <div className="p-1 bg-gray-100 rounded-2xl ring-gray-200/30 ring-inset ring-1">
                        <div className="bg-white rounded-xl shadow-base divide-y divide-gray-100">
                            <div className="px-5 py-4 flex items-center">
                                <div className="font-semibold flex-1">
                                    Advertising identity
                                </div>
                            </div>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();

                                    if (isDisabled) {
                                        return;
                                    }

                                    form.patch(
                                        route("update-advertising-identity")
                                    );
                                }}
                                className="p-5"
                            >
                                <div className="grid grid-cols-2 gap-2.5">
                                    <label>
                                        <span className="block mb-2 font-semibold">
                                            Beneficiary name
                                        </span>
                                        <Input
                                            type="text"
                                            value={form.data.dsaBeneficiary}
                                            onChange={(e) => {
                                                form.setData(
                                                    "dsaBeneficiary",
                                                    e.target.value
                                                );
                                            }}
                                            required
                                            placeholder="Your business name e.g. Acme"
                                        />
                                    </label>

                                    <label>
                                        <span className="block mb-2 font-semibold">
                                            Payer name
                                        </span>
                                        <Input
                                            type="text"
                                            value={form.data.dsaPayor}
                                            onChange={(e) => {
                                                form.setData(
                                                    "dsaPayor",
                                                    e.target.value
                                                );
                                            }}
                                            required
                                            placeholder="Your full name e.g. John Doe"
                                        />
                                    </label>
                                </div>

                                <div className="mt-5 flex justify-between items-center">
                                    <div className="text-xs font-medium flex items-center gap-2">
                                        <i className="fa-solid fa-circle-exclamation text-gray-400" />
                                        <span className="text-gray-500">
                                            These fields are only required if
                                            you are advertising in the EU.
                                        </span>
                                    </div>
                                    <div className="flex justify-end items-center gap-2">
                                        <Button
                                            type="submit"
                                            disabled={isDisabled}
                                            variant="primary"
                                            loading={form.processing}
                                        >
                                            Save changes
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
