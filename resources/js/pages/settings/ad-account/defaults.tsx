import { Layout } from "@/components/layouts/settings-layout";
import { SettingsHeader } from "@/components/settings/settings-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { useSyncedForm } from "@/lib/hooks/use-synced-form";
import { useMemo } from "react";

interface Props {
    websiteUrl: string | null;
}

export default function Defaults({ websiteUrl }: Props) {
    const form = useSyncedForm({
        websiteUrl: websiteUrl ?? "",
    });

    const isDisabled = useMemo(() => {
        if (!form.isDirty) {
            return true;
        }

        return !form.data.websiteUrl;
    }, [form.isDirty, form.data.websiteUrl]);

    return (
        <Layout title="Defaults">
            <div className="p-3">
                <div className="max-w-3xl mx-auto">
                    <div className="p-1 bg-gray-100 rounded-2xl ring-gray-200/30 ring-inset ring-1">
                        <div className="bg-white rounded-xl shadow-base divide-y divide-gray-100">
                            <div className="px-5 py-4 flex items-center">
                                <SettingsHeader includeAdAccount>
                                    Defaults
                                </SettingsHeader>
                            </div>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();

                                    if (isDisabled) {
                                        return;
                                    }

                                    form.patch(route("update-defaults"), {
                                        onSuccess: () => {
                                            toast({
                                                contents:
                                                    "Defaults saved successfully",
                                            });
                                        },
                                        onError: (errors) => {
                                            toast({
                                                type: "ERROR",
                                                contents:
                                                    "Something went wrong, please try again.",
                                            });
                                        },
                                    });
                                }}
                                className="divide-y divide-gray-100"
                            >
                                <div className="p-5">
                                    <label>
                                        <span className="block mb-2 font-semibold">
                                            Default website URL
                                        </span>
                                        <Input
                                            type="url"
                                            value={form.data.websiteUrl}
                                            onChange={(e) => {
                                                form.setData(
                                                    "websiteUrl",
                                                    e.target.value
                                                );
                                            }}
                                            placeholder="e.g. the URL of your store"
                                            required
                                        />
                                    </label>
                                </div>
                                <div className="p-5 flex justify-end items-center">
                                    <Button
                                        type="submit"
                                        disabled={isDisabled}
                                        variant="primary"
                                        loading={form.processing}
                                    >
                                        Save changes
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
