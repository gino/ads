import { StatusTag } from "@/components/ui/status-tag";
import * as Ariakit from "@ariakit/react";
import { router } from "@inertiajs/react";
import axios from "axios";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { CommandItem } from "../command-item";
import { ShortcutButtonHint } from "../components/shortcut-hint";
import { useCommandMenu } from "../store";

export function Campaigns() {
    const [campaigns, setCampaigns] = useState<App.Data.AdCampaignData[]>([]);
    const { setIsOpen, isLoading, setIsLoading } = useCommandMenu();

    useEffect(() => {
        setIsLoading(true);
        axios
            .get(route("command-menu.api.campaigns"))
            .then(({ data }) => {
                setCampaigns(data);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [setIsLoading]);

    if (campaigns.length === 0 || isLoading) {
        return null;
    }

    return (
        <Command.Group className="p-2">
            {campaigns.map((campaign) => (
                <CommandItem
                    key={campaign.id}
                    id="campaign-item"
                    onSelect={() => {
                        setIsOpen(false);
                        router.visit(
                            route("dashboard.campaigns", {
                                _query: {
                                    selected_campaign_ids: campaign.id,
                                },
                            })
                        );
                    }}
                    keywords={[campaign.id, campaign.name]}
                    value={campaign.id}
                >
                    <div className="flex items-center gap-3 w-full truncate">
                        <div className="flex flex-1 gap-3 items-center truncate">
                            <StatusTag
                                status={campaign.effectiveStatus}
                                showLabel={false}
                            />
                            <div className="font-semibold truncate">
                                {campaign.name}
                            </div>
                        </div>
                        <div className="font-semibold bg-gray-100 text-[12px] px-2 inline-block rounded-full leading-5 group-data-[selected='true']:bg-gray-200">
                            {campaign.dailyBudget !== null ? "CBO" : "ABO"}
                        </div>
                    </div>
                </CommandItem>
            ))}
        </Command.Group>
    );
}

export function CampaignContextMenu() {
    const [isOpen, setIsOpen] = useState(false);

    const store = Ariakit.usePopoverStore({
        open: isOpen,
        setOpen: setIsOpen,
    });

    useHotkeys(
        ["meta+k", "ctrl+k"],
        () => {
            setIsOpen((o) => !o);
        },
        [setIsOpen],
        {
            preventDefault: true,
            enableOnFormTags: true,
        }
    );

    return (
        <Ariakit.PopoverProvider store={store} placement="top-end">
            <Ariakit.PopoverDisclosure
                render={(props) => (
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
                )}
            />

            <Ariakit.Popover
                store={store}
                portal
                gutter={18}
                alwaysVisible
                autoFocusOnHide
                finalFocus={
                    document.querySelector("input[cmdk-input]") as HTMLElement
                }
                // unmountOnHide
                className="z-50 w-80"
            >
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{
                                opacity: 0,
                                scale: 0.98,
                                filter: "blur(1px)",
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                filter: "blur(0px)",
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.98,
                                filter: "blur(1px)",
                            }}
                            transition={{
                                duration: 0.1,
                                ease: "easeInOut",
                            }}
                            className="bg-white shadow-base-popup origin-bottom-right w-full p-1 space-y-1 scroll-p-1 rounded-xl max-h-72 overflow-y-auto"
                        >
                            <Command className="outline-none">
                                <Command.List className="outline-none">
                                    <Command.Group>
                                        {Array(20)
                                            .fill(null)
                                            .map((_, index) => (
                                                <Command.Item
                                                    key={index}
                                                    onSelect={() => {
                                                        setIsOpen(false);
                                                    }}
                                                    className="data-[selected='true']:bg-gray-100 px-4 py-3 text-sm rounded-lg cursor-pointer font-semibold"
                                                >
                                                    yeet {index + 1}
                                                </Command.Item>
                                            ))}
                                    </Command.Group>
                                </Command.List>
                            </Command>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Ariakit.Popover>
        </Ariakit.PopoverProvider>
    );
}
