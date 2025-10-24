import { StatusTag } from "@/components/ui/status-tag";
import { router } from "@inertiajs/react";
import axios from "axios";
import { Command, CommandSeparator } from "cmdk";
import { useEffect, useState } from "react";
import { CommandFooterPortal } from "../components/command-footer";
import { CommandItem } from "../components/command-item";
import { CommandSubItem } from "../components/command-sub-item";
import { CommandSubMenu } from "../components/command-sub-menu";
import { ShortcutButtonHint } from "../components/shortcut-hint";
import { useCommandMenu } from "../store";

export function Ads() {
    const [ads, setAds] = useState<App.Data.AdData[]>([]);
    const { setIsOpen, isLoading, setIsLoading } = useCommandMenu();

    const [selected, setSelected] = useState<App.Data.AdData | null>(null);

    useEffect(() => {
        setIsLoading(true);
        axios
            .get(route("command-menu.api.ads"))
            .then(({ data }) => {
                setAds(data);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [setIsLoading]);

    if (ads.length === 0 || isLoading) {
        return null;
    }

    return (
        <Command.Group className="p-2">
            {ads.map((ad) => (
                <CommandItem
                    key={ad.id}
                    id="ad-item"
                    onSelect={() => {
                        setIsOpen(false);
                        router.visit(
                            route("dashboard.campaigns.ads", {
                                _query: {
                                    selected_ad_ids: ad.id,
                                },
                            })
                        );
                    }}
                    onSelectedChange={(selected) => {
                        if (selected) {
                            setSelected(ad);
                        }
                    }}
                    keywords={[ad.id, ad.name]}
                    value={ad.id}
                >
                    <div className="flex gap-3 items-center truncate">
                        <StatusTag status={ad.status} showLabel={false} />
                        <div className="font-semibold truncate">{ad.name}</div>
                    </div>
                </CommandItem>
            ))}

            <AdContextMenu ad={selected} />
        </Command.Group>
    );
}

interface AdContextMenuProps {
    ad: App.Data.AdData | null;
}

function AdContextMenu({ ad }: AdContextMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (!ad) {
        return null;
    }

    return (
        <CommandSubMenu
            setIsOpen={setIsOpen}
            isOpen={isOpen}
            disclosure={(props) => (
                <CommandFooterPortal>
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
                    <Command.Group>
                        <CommandSubItem
                            onSelect={() => {
                                setIsOpen(false);
                            }}
                        >
                            <div className="flex items-center truncate">
                                <div className="flex-1 truncate">
                                    {ad.status === "ACTIVE"
                                        ? "Turn ad off"
                                        : "Turn ad on"}
                                </div>
                            </div>
                        </CommandSubItem>
                        <CommandSeparator />
                        <CommandSubItem
                            onSelect={() => {
                                setIsOpen(false);
                            }}
                        >
                            <div className="flex items-center truncate">
                                <div className="flex-1 truncate">
                                    View ad insights
                                </div>
                            </div>
                        </CommandSubItem>
                    </Command.Group>
                </Command.List>
            </Command>
        </CommandSubMenu>
    );
}
