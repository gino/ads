import { useSelectedAdAccount } from "@/lib/hooks/use-selected-ad-account";
import { router } from "@inertiajs/react";
import { useState } from "react";
import { CommandFooterPortal } from "../components/command-footer";
import { CommandGroup } from "../components/command-group";
import { CommandItem } from "../components/command-item";
import { ShortcutIconHint } from "../components/shortcut-hint";
import { useCommandMenu } from "../store";

const items = [
    {
        label: "Account",
        href: route("dashboard.settings.account"),
    },
    {
        label: "Billing",
        href: route("dashboard.settings.account"),
    },
    {
        label: "Ad accounts",
        href: route("dashboard.settings.ad-accounts"),
    },
    {
        label: "Notifications",
        href: route("dashboard.settings.account"),
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
    {
        label: "Integrations",
        href: route("dashboard.settings.ad-account.general"),
        includeAdAccount: true,
    },
] as const;

export function Settings() {
    const { setIsOpen, pages } = useCommandMenu();
    const { selectedAdAccount } = useSelectedAdAccount();

    const [selectedIndex, setSelectedIndex] = useState<number | null>();

    const page = pages[pages.length - 1];

    return (
        <CommandGroup heading="Settings">
            {items.map((item, index) => (
                <CommandItem
                    key={index}
                    id="setting-item"
                    onSelect={() => {
                        setIsOpen(false);
                        router.visit(item.href);
                    }}
                    keywords={["settings", item.label]}
                    onSelectedChange={() => {
                        setSelectedIndex(items.indexOf(item));
                    }}
                >
                    <div className="flex items-center gap-2">
                        <i className="fa-regular fa-arrow-right text-gray-400 mr-1.5 fa-fw -ml-0.5 group-data-[selected='true']:text-black" />
                        <div className="text-gray-400">Settings</div>
                        <div className="text-gray-300">/</div>
                        {"includeAdAccount" in item &&
                            item.includeAdAccount && (
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

            {selectedIndex !== null && page === "settings" && (
                <CommandFooterPortal>
                    <ShortcutIconHint
                        label="Jump to"
                        keys={[
                            <i className="fa-solid fa-arrow-turn-down-left text-[8px]" />,
                        ]}
                    />
                </CommandFooterPortal>
            )}
        </CommandGroup>
    );
}
