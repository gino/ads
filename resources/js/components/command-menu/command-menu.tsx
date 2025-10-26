import { cn } from "@/lib/cn";
import { useSelectedAdAccount } from "@/lib/hooks/use-selected-ad-account";
import * as Ariakit from "@ariakit/react";
import { router } from "@inertiajs/react";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
    CommandFooter,
    CommandFooterPortal,
} from "./components/command-footer";
import { CommandGroup } from "./components/command-group";
import { CommandItem } from "./components/command-item";
import { ShortcutIconHint } from "./components/shortcut-hint";
import { AdAccountSelector } from "./pages/ad-account-selector";
import { Ads } from "./pages/ads";
import { AdSets } from "./pages/adsets";
import { Campaigns } from "./pages/campaigns";
import { Settings } from "./pages/settings";
import { useCommandMenu } from "./store";

export type CommandMenuPage =
    | "ad-accounts"
    | "settings"
    | "campaigns"
    | "adsets"
    | "ads";

export function CommandMenu() {
    const {
        isOpen,
        setIsOpen,
        pages,
        setPage,
        setPages,
        search,
        setSearch,
        placeholder,
        isLoading,
        selectedItemId,
    } = useCommandMenu();

    const { selectedAdAccount } = useSelectedAdAccount();

    const dialog = Ariakit.useDialogStore({
        open: isOpen,
        setOpen: setIsOpen,
    });

    useHotkeys(
        ["meta+k", "ctrl+k", "Slash"],
        () => {
            // setIsOpen((o) => !o);

            if (isOpen) return;

            setIsOpen(true);
        },
        [setIsOpen, isOpen],
        {
            preventDefault: true,
            // enableOnFormTags: true,
            // scopes: ["command-menu"],
        }
    );

    const listRef = useRef<HTMLDivElement>(null);

    const page = pages[pages.length - 1];

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = 0;
        }
    }, [search, page]);

    return (
        <AnimatePresence>
            {isOpen && (
                <Ariakit.Dialog
                    portal
                    store={dialog}
                    alwaysVisible
                    hideOnInteractOutside={(event) => {
                        if (event instanceof FocusEvent) {
                            return false;
                        }

                        return true;
                    }}
                    hideOnEscape
                    autoFocusOnShow
                    render={(props) => (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            hidden={!open}
                            transition={{ duration: 0.1, ease: "easeInOut" }}
                            className="flex z-50 fixed inset-0 justify-center items-center"
                        >
                            <div {...props} />
                        </motion.div>
                    )}
                    className={cn(
                        "w-full flex flex-col max-h-[min(var(--dialog-viewport-height),500px)] px-4 py-4 outline-none max-w-3xl"
                    )}
                >
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
                        className="w-full shadow-xs bg-white/60 p-2 rounded-3xl backdrop-blur-[1px] flex flex-col h-full min-h-0 origin-center ring-1 ring-black/10"
                    >
                        <div className="overflow-hidden w-full bg-white rounded-2xl shadow-dialog flex flex-col h-full min-h-0 ring-1 ring-black/5">
                            <Command
                                label="Global command menu"
                                onKeyDown={(e) => {
                                    if (
                                        e.key === "Backspace" &&
                                        !search &&
                                        pages.length > 0
                                    ) {
                                        e.preventDefault();
                                        setPages((pages) => pages.slice(0, -1));
                                    }
                                }}
                                loop
                                className="flex flex-col h-full min-h-0 outline-none"
                            >
                                <div className="shrink-0 border-b border-gray-100">
                                    <div className="relative">
                                        <Command.Input
                                            value={search}
                                            onValueChange={setSearch}
                                            className="w-full px-5 py-4 bg-white placeholder-gray-400 font-semibold outline-none transition duration-150 ease-in-out"
                                            placeholder={placeholder}
                                            autoFocus
                                        />

                                        {isLoading && (
                                            <div className="absolute top-1/2 -translate-y-1/2 right-5 pointer-events-none">
                                                <i className="fa-solid fa-spinner-third animate-spin text-[12px] text-gray-300" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Command.List
                                    ref={listRef}
                                    className="overflow-y-auto flex-1 scroll-p-2 outline-none [&>div[cmdk-list-sizer]>div:has(>div[cmdk-group-items]:not(:empty))]:border-t [&>div[cmdk-list-sizer]>div:has(>div[cmdk-group-items]:not(:empty))]:border-gray-100 -mt-px"
                                >
                                    {isLoading ? (
                                        <Command.Loading className="h-90"></Command.Loading>
                                    ) : (
                                        <Command.Empty className="text-center py-10">
                                            <div className="font-semibold mb-1">
                                                No results found
                                            </div>
                                            <div className="text-xs font-medium text-gray-500">
                                                We couldn't find any resources
                                                or commands matching your
                                                search.
                                            </div>
                                        </Command.Empty>
                                    )}

                                    {!page && (
                                        <>
                                            <CommandGroup>
                                                <CommandItem
                                                    id="switch-ad-account"
                                                    onSelect={() => {
                                                        setPage("ad-accounts");
                                                    }}
                                                    icon="fa-regular fa-rectangle-history"
                                                >
                                                    <div className="flex-1">
                                                        Switch ad account
                                                    </div>
                                                    <span className="font-semibold bg-gray-100 text-[12px] px-2 inline-block rounded-full leading-5 group-data-[selected='true']:bg-gray-200">
                                                        {selectedAdAccount.name}
                                                    </span>
                                                </CommandItem>

                                                <CommandItem
                                                    id="search-campaigns"
                                                    onSelect={() => {
                                                        setPage("campaigns");
                                                    }}
                                                    icon="fa-regular fa-rectangle-history"
                                                >
                                                    Search campaigns
                                                </CommandItem>
                                                <CommandItem
                                                    id="search-adsets"
                                                    onSelect={() => {
                                                        setPage("adsets");
                                                    }}
                                                    icon="fa-regular fa-rectangle-history"
                                                >
                                                    Search ad sets
                                                </CommandItem>
                                                <CommandItem
                                                    id="search-ads"
                                                    onSelect={() => {
                                                        setPage("ads");
                                                    }}
                                                    icon="fa-regular fa-rectangle-history"
                                                >
                                                    Search ads
                                                </CommandItem>
                                                <CommandItem
                                                    id="create-ads"
                                                    onSelect={() => {
                                                        setIsOpen(false);
                                                        router.visit(
                                                            route(
                                                                "dashboard.upload"
                                                            )
                                                        );
                                                    }}
                                                    icon="fa-regular fa-plus"
                                                >
                                                    Create ads
                                                </CommandItem>

                                                <CommandItem
                                                    id="create-adsets"
                                                    onSelect={() => {
                                                        setIsOpen(false);
                                                        router.visit(
                                                            route(
                                                                "dashboard.upload"
                                                            )
                                                        );
                                                    }}
                                                    icon="fa-regular fa-plus"
                                                >
                                                    Create ad sets
                                                </CommandItem>
                                            </CommandGroup>

                                            <CommandGroup heading="Navigation">
                                                <CommandItem
                                                    id="dashboard"
                                                    onSelect={() => {
                                                        setIsOpen(false);
                                                        router.visit(
                                                            route(
                                                                "dashboard.index"
                                                            )
                                                        );
                                                    }}
                                                    icon="fa-regular fa-grid-2"
                                                >
                                                    Dashboard
                                                </CommandItem>
                                                <CommandItem
                                                    id="upload"
                                                    onSelect={() => {
                                                        setIsOpen(false);
                                                        router.visit(
                                                            route(
                                                                "dashboard.upload"
                                                            )
                                                        );
                                                    }}
                                                    icon="fa-regular fa-arrow-up-from-bracket"
                                                >
                                                    Upload
                                                </CommandItem>
                                                <CommandItem
                                                    id="campaigns"
                                                    onSelect={() => {
                                                        setIsOpen(false);
                                                        router.visit(
                                                            route(
                                                                "dashboard.campaigns"
                                                            )
                                                        );
                                                    }}
                                                    icon="fa-regular fa-list"
                                                >
                                                    Campaigns
                                                </CommandItem>
                                                <CommandItem
                                                    id="settings"
                                                    onSelect={() => {
                                                        setPage("settings");
                                                    }}
                                                    icon="fa-regular fa-cog"
                                                >
                                                    Settings
                                                </CommandItem>
                                            </CommandGroup>

                                            <CommandGroup>
                                                <CommandItem
                                                    id="logout"
                                                    onSelect={() => {
                                                        setIsOpen(false);
                                                        router.post(
                                                            route("logout")
                                                        );
                                                    }}
                                                    className="data-[selected='true']:ring-red-900/5 data-[selected='true']:bg-red-900/5"
                                                >
                                                    <div className="flex items-center gap-4 text-red-800">
                                                        <i className="fa-fw fa-regular fa-sign-out -ml-0.5" />
                                                        <div>Log out</div>
                                                    </div>
                                                </CommandItem>
                                            </CommandGroup>
                                        </>
                                    )}

                                    {page === "ad-accounts" && (
                                        <AdAccountSelector />
                                    )}

                                    {/* Also show results of 'Settings' page when searching */}
                                    {(page === "settings" ||
                                        (!page && search.length > 0)) && (
                                        <Settings />
                                    )}

                                    {/* {page === "settings" && <Settings />} */}
                                    {page === "campaigns" && <Campaigns />}
                                    {page === "adsets" && <AdSets />}
                                    {page === "ads" && <Ads />}
                                </Command.List>

                                {!page && selectedItemId && (
                                    <CommandFooterPortal>
                                        <ShortcutIconHint
                                            label="Jump to"
                                            keys={[
                                                <i className="fa-solid fa-arrow-turn-down-left text-[8px]" />,
                                            ]}
                                        />
                                    </CommandFooterPortal>
                                )}

                                <CommandFooter />
                            </Command>
                        </div>
                    </motion.div>
                </Ariakit.Dialog>
            )}
        </AnimatePresence>
    );
}
