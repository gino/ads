import { useSelectedAdAccount } from "@/lib/hooks/use-selected-ad-account";
import { SharedData } from "@/types";
import { router, usePage } from "@inertiajs/react";
import { Command } from "cmdk";
import { useMemo, useState } from "react";
import { CommandFooterPortal } from "../components/command-footer";
import { CommandGroup } from "../components/command-group";
import { CommandItem } from "../components/command-item";
import { CommandSeparator } from "../components/command-separator";
import { CommandSubItem } from "../components/command-sub-item";
import { CommandSubMenu } from "../components/command-sub-menu";
import {
    ShortcutButtonHint,
    ShortcutIconHint,
} from "../components/shortcut-hint";
import { useCommandMenu } from "../store";

export function AdAccountSelector() {
    const { props } = usePage<SharedData>();

    const { selectAdAccount, selectedAdAccountId } = useSelectedAdAccount();

    const { setIsOpen } = useCommandMenu();

    const [selectedId, setSelectedId] = useState<string | null>(null);

    const selected = useMemo(() => {
        return props.adAccounts.find((c) => c.id === selectedId) ?? null;
    }, [selectedId, props.adAccounts]);

    const sortedAdAccounts = useMemo(() => {
        return props.adAccounts.sort((a, b) => {
            return Number(b.isActive) - Number(a.isActive);
        });
    }, [props.adAccounts]);

    return (
        <CommandGroup>
            {sortedAdAccounts.map((adAccount) => (
                <CommandItem
                    key={adAccount.id}
                    id="ad-account-item"
                    onSelect={() => {
                        if (adAccount.id !== selectedAdAccountId) {
                            selectAdAccount(adAccount.id);
                        }

                        setIsOpen(false);
                    }}
                    onSelectedChange={(selected) => {
                        if (selected) {
                            setSelectedId(adAccount.id);
                        }
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

            {selected && <AdAccountContextMenu adAccount={selected} />}
        </CommandGroup>
    );
}

interface AdAccountContextMenuProps {
    adAccount: App.Data.AdAccountData;
}

function AdAccountContextMenu({ adAccount }: AdAccountContextMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    const { setIsOpen: setCommandMenuIsOpen } = useCommandMenu();
    const { selectAdAccount, selectedAdAccountId } = useSelectedAdAccount();

    return (
        <CommandSubMenu
            setIsOpen={setIsOpen}
            isOpen={isOpen}
            disclosure={(props) => (
                <CommandFooterPortal>
                    <ShortcutIconHint
                        label="Switch to"
                        keys={[
                            <i className="fa-solid fa-arrow-turn-down-left text-[8px]" />,
                        ]}
                    />
                    <ShortcutButtonHint
                        label="Actions"
                        onClick={() => {
                            setIsOpen((o) => !o);
                        }}
                        keys={[
                            <i className="fa-solid fa-command text-[8px]" />,
                            <span>K</span>,
                        ]}
                        aria-expanded={isOpen}
                        {...props}
                    />
                </CommandFooterPortal>
            )}
        >
            <Command loop className="outline-none">
                <Command.List className="outline-none">
                    <CommandSubItem
                        onSelect={() => {
                            if (adAccount.id !== selectedAdAccountId) {
                                selectAdAccount(adAccount.id);
                            }

                            setIsOpen(false);
                            setCommandMenuIsOpen(false);
                        }}
                        disabled={selectedAdAccountId === adAccount.id}
                    >
                        <div className="flex items-center truncate">
                            <div className="flex-1 truncate">
                                Switch to ad account
                            </div>

                            <div className="truncate max-w-1/3 font-semibold bg-gray-100 text-[12px] px-2 inline-block rounded-full leading-5 group-data-[selected='true']:bg-gray-200">
                                {adAccount.name}
                            </div>
                        </div>
                    </CommandSubItem>
                    <CommandSeparator />
                    <CommandSubItem
                        onSelect={() => {
                            setIsOpen(false);
                            setCommandMenuIsOpen(false);
                            router.visit(
                                route("dashboard.settings.ad-account.general")
                            );
                        }}
                    >
                        <div className="flex items-center truncate">
                            <div className="flex-1 truncate">
                                Configure ad account
                            </div>
                        </div>
                    </CommandSubItem>
                </Command.List>
            </Command>
        </CommandSubMenu>
    );
}
