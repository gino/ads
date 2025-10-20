import { useSelectedAdAccount } from "@/lib/hooks/use-selected-ad-account";
import { useMemo } from "react";
import { Select } from "../ui/select";

interface Props {
    labels?: string[];
    isLoading: boolean;
    pages: App.Data.FacebookPageData[];
    facebookPageId: string;
    instagramPageId: string;
    onChangeFacebookPageId: (pageId: string) => void;
    onChangeInstagramPageId: (pageId: string) => void;
}

export function PagesInput({
    labels = ["Facebook page", "Instagram account"],
    isLoading,
    pages,
    facebookPageId,
    instagramPageId,
    onChangeFacebookPageId,
    onChangeInstagramPageId,
}: Props) {
    const { selectedAdAccount } = useSelectedAdAccount();

    const [facebookLabel, instagramLabel] = labels;

    const filteredInstagramAccounts = useMemo(() => {
        if (!facebookPageId || isLoading) {
            return [];
        }

        const page = pages.find((p) => p.id === facebookPageId)!;

        if (!page?.instagramAccount) {
            return [];
        }

        return [page.instagramAccount];
    }, [facebookPageId, isLoading, pages]);

    return (
        <div className="grid grid-cols-2 gap-2.5">
            <Select
                label={facebookLabel}
                placeholder="Select a page"
                isLoading={isLoading}
                items={pages}
                value={facebookPageId}
                onChange={(value) => {
                    onChangeFacebookPageId(value);

                    const page = pages.find((p) => p.id === value)!;

                    if (!page) {
                        return;
                    }

                    if (!page.instagramAccount) {
                        onChangeInstagramPageId("");
                        return;
                    }

                    onChangeInstagramPageId(page.instagramAccount.id);
                }}
                getItem={(page) => ({
                    value: page.id,
                    label: (
                        <div className="flex flex-1 gap-3 items-center mr-1 text-left truncate">
                            <div className="flex-1 truncate flex items-center gap-3">
                                <div className="h-7 w-7 bg-gray-100 rounded-full overflow-hidden shrink-0 relative after:absolute after:inset-0 after:ring-1 after:ring-inset after:rounded-[inherit] after:ring-black/5">
                                    <img
                                        src={page.picture!}
                                        className="h-full w-full object-cover object-center"
                                    />
                                </div>
                                <div className="truncate">
                                    <div className="font-semibold truncate mb-px">
                                        {page.name}
                                    </div>
                                    <div className="text-[12px] font-medium text-gray-500 truncate">
                                        ID: {page.id}
                                    </div>
                                </div>
                            </div>
                            {page.businessId !== null &&
                                selectedAdAccount.businessId ===
                                    page.businessId && (
                                    <div className="font-semibold bg-gray-100 text-[12px] px-2 inline-block rounded-full leading-5 group-hover:bg-gray-200 group-data-[selected='true']:bg-black/5 group-data-[active-item]:bg-gray-200 self-start">
                                        Default
                                    </div>
                                )}
                        </div>
                    ),
                })}
                getSelectedItem={(page) => (
                    <div className="flex items-center gap-3">
                        <div className="h-5 w-5 bg-gray-100 rounded-full overflow-hidden shrink-0 relative after:absolute after:inset-0 after:ring-1 after:ring-inset after:rounded-[inherit] after:ring-black/5">
                            <img
                                src={page.picture!}
                                className="h-full w-full object-cover object-center"
                            />
                        </div>
                        <div className="font-semibold">{page.name}</div>
                    </div>
                )}
            />

            <Select
                label={instagramLabel}
                placeholder={
                    !facebookPageId
                        ? "Select a Facebook page"
                        : "Select an account"
                }
                isLoading={isLoading}
                items={filteredInstagramAccounts}
                value={instagramPageId}
                disabled={filteredInstagramAccounts.length === 0}
                getDisabledLabel={
                    facebookPageId
                        ? () => (
                              <div className="font-semibold">
                                  <span>Use Facebook page</span>
                              </div>
                          )
                        : undefined
                }
                onChange={(value) => {
                    onChangeInstagramPageId(value);
                }}
                getItem={(account) => ({
                    value: account.id,
                    label: (
                        <div className="flex flex-1 gap-3 items-center mr-1 text-left truncate">
                            <div className="flex-1 truncate flex items-center gap-3">
                                <div className="h-7 w-7 bg-gray-100 rounded-full overflow-hidden shrink-0 relative after:absolute after:inset-0 after:ring-1 after:ring-inset after:rounded-[inherit] after:ring-black/5">
                                    <img
                                        src={account.picture}
                                        className="h-full w-full object-cover object-center"
                                    />
                                </div>
                                <div className="truncate">
                                    <div className="font-semibold truncate mb-px">
                                        {account.username}
                                    </div>
                                    <div className="text-[12px] font-medium text-gray-500 truncate">
                                        ID: {account.id}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ),
                })}
                getSelectedItem={(page) => (
                    <div className="flex items-center gap-3">
                        <div className="h-5 w-5 bg-gray-100 rounded-full overflow-hidden shrink-0 relative after:absolute after:inset-0 after:ring-1 after:ring-inset after:rounded-[inherit] after:ring-black/5">
                            <img
                                src={page.picture}
                                className="h-full w-full object-cover object-center"
                            />
                        </div>
                        <div className="font-semibold">{page.username}</div>
                    </div>
                )}
                clearable={false}
            />
        </div>
    );
}
