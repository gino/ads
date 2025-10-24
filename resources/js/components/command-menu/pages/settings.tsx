import { useSelectedAdAccount } from "@/lib/hooks/use-selected-ad-account";
import { router } from "@inertiajs/react";
import { Command } from "cmdk";
import { useState } from "react";
import { CommandFooterPortal } from "../components/command-footer";
import { CommandItem } from "../components/command-item";
import { ShortcutIconHint } from "../components/shortcut-hint";
import { useCommandMenu } from "../store";

/* Make these dynamic (from settings sidebar layout) */
const items = [
    {
        label: "Account",
        href: route("dashboard.settings.account"),
        includeAdAccount: false,
    },
    {
        label: "Ad accounts",
        href: route("dashboard.settings.ad-accounts"),
        includeAdAccount: false,
    },
    {
        label: "General",
        href: route("dashboard.settings.ad-account.general"),
        includeAdAccount: true,
    },
    {
        label: "Advertising identity",
        href: route("dashboard.settings.ad-account.advertising-identity"),
        includeAdAccount: true,
    },
    {
        label: "Defaults",
        href: route("dashboard.settings.ad-account.defaults"),
        includeAdAccount: true,
    },
] as const;

export function Settings() {
    const { setIsOpen } = useCommandMenu();
    const { selectedAdAccount } = useSelectedAdAccount();

    const [selected, setSelected] = useState<(typeof items)[number] | null>();

    return (
        <Command.Group className="p-2">
            {items.map((item, index) => (
                <CommandItem
                    key={index}
                    id="setting-item"
                    onSelect={() => {
                        setIsOpen(false);
                        router.visit(item.href);
                    }}
                    onSelectedChange={() => {
                        setSelected(item);
                    }}
                >
                    <div className="flex items-center gap-2">
                        <i className="fa-regular fa-arrow-right text-gray-400 mr-1.5 fa-fw -ml-0.5" />
                        <div className="text-gray-400">Settings</div>
                        <div className="text-gray-300">/</div>
                        {item.includeAdAccount && (
                            <>
                                <div className="text-gray-400 max-w-32 truncate">
                                    {selectedAdAccount.name}
                                </div>
                                <div className="text-gray-300">/</div>
                            </>
                        )}
                        <div>{item.label}</div>
                    </div>
                </CommandItem>
            ))}

            {selected && (
                <CommandFooterPortal>
                    <ShortcutIconHint
                        label="Jump to"
                        keys={[
                            <i className="fa-solid fa-arrow-turn-down-left text-[8px]" />,
                        ]}
                    />
                </CommandFooterPortal>
            )}
        </Command.Group>
    );
}
