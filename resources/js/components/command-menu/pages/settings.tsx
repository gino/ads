import { useSelectedAdAccount } from "@/lib/hooks/use-selected-ad-account";
import { router } from "@inertiajs/react";
import { Command } from "cmdk";
import { CommandItem } from "../command-item";
import { useCommandMenu } from "../store";

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
];

export function Settings() {
    const { setIsOpen } = useCommandMenu();
    const { selectedAdAccount } = useSelectedAdAccount();

    return (
        <Command.Group className="p-2">
            {/* Make these dynamic (from settings sidebar layout) */}
            {items.map((item, index) => (
                <CommandItem
                    key={index}
                    id="setting-item"
                    onSelect={() => {
                        setIsOpen(false);
                        router.visit(item.href);
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
        </Command.Group>
    );
}
