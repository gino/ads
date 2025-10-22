import { useSelectedAdAccount } from "@/lib/hooks/use-selected-ad-account";
import { SharedData } from "@/types";
import { usePage } from "@inertiajs/react";
import { Command } from "cmdk";
import { CommandItem } from "../command-item";
import { useCommandMenu } from "../store";

export function AdAccountSelector() {
    const { props } = usePage<SharedData>();

    const { selectAdAccount, selectedAdAccountId } = useSelectedAdAccount();

    const { setIsOpen, resetPage } = useCommandMenu();

    return (
        <Command.Group className="p-2">
            {props.adAccounts.map((adAccount) => (
                <CommandItem
                    key={adAccount.id}
                    onSelect={() => {
                        if (adAccount.id !== selectedAdAccountId) {
                            selectAdAccount(adAccount.id);
                        }

                        resetPage();
                        setIsOpen(false);
                    }}
                    disabled={!adAccount.isActive}
                >
                    <div className="flex items-start w-full gap-3">
                        <div className="w-[16px]">
                            {selectedAdAccountId === adAccount.id && (
                                <i className="fa-solid fa-check text-[12px] text-gray-400" />
                            )}
                        </div>
                        <div className="flex-1 truncate">
                            <div className="truncate mb-px">
                                {adAccount.name}
                            </div>
                            <div className="text-[12px] font-medium text-gray-500">
                                ID: {adAccount.externalId.replace("act_", "")}
                            </div>
                        </div>

                        <div>
                            {!adAccount.isActive ? (
                                <span className="font-semibold bg-gray-100 text-[12px] px-2 inline-block rounded-full leading-5 group-data-[selected='true']:bg-gray-200">
                                    Inactive
                                </span>
                            ) : (
                                <span className="font-semibold bg-gray-100 text-[12px] px-2 inline-block rounded-full leading-5 group-data-[selected='true']:bg-gray-200">
                                    {adAccount.currency}
                                </span>
                            )}
                        </div>
                    </div>
                </CommandItem>
            ))}
        </Command.Group>
    );
}
