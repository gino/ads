import { cn } from "@/lib/cn";
import { useSelectedAdAccount } from "@/lib/hooks/use-selected-ad-account";
import * as Ariakit from "@ariakit/react";
import { router } from "@inertiajs/react";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "motion/react";
import { useHotkeys } from "react-hotkeys-hook";
import { CommandItem } from "./command-item";
import { AdAccountSelector } from "./pages/ad-account-selector";
import { AdSets } from "./pages/ad-sets";
import { Ads } from "./pages/ads";
import { Campaigns } from "./pages/campaigns";
import { Settings } from "./pages/settings";
import { initialPlaceholder, useCommandMenu } from "./store";

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
        setPlaceholder,
        isLoading,
    } = useCommandMenu();

    const { selectedAdAccount } = useSelectedAdAccount();

    const dialog = Ariakit.useDialogStore({
        open: isOpen,
        setOpen: setIsOpen,
    });

    useHotkeys(
        ["meta+k", "ctrl+k", "Slash"],
        () => {
            setIsOpen((o) => !o);
        },
        [setIsOpen],
        { preventDefault: true }
    );

    const page = pages[pages.length - 1];

    return (
        <AnimatePresence>
            {isOpen && (
                <Ariakit.Dialog
                    portal
                    store={dialog}
                    alwaysVisible
                    hideOnInteractOutside
                    // hideOnEscape={false}
                    autoFocusOnShow={false}
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
                        "w-full flex flex-col max-h-[min(var(--dialog-viewport-height),500px)] py-4 outline-none max-w-2xl"
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
                                    if (e.key === "Backspace" && !search) {
                                        e.preventDefault();
                                        setPages((pages) => pages.slice(0, -1));
                                        setPlaceholder(initialPlaceholder);
                                    }
                                }}
                                loop
                                className="flex flex-col h-full min-h-0"
                            >
                                <div className="p-2 shrink-0">
                                    <div className="relative">
                                        <Command.Input
                                            value={search}
                                            onValueChange={setSearch}
                                            className="w-full px-3.5 py-2.5 bg-white rounded-lg ring-1 ring-gray-200 placeholder-gray-400 font-semibold outline-none transition duration-150 ease-in-out"
                                            placeholder={placeholder}
                                            autoFocus
                                        />

                                        {isLoading && (
                                            <div className="absolute top-1/2 -translate-y-1/2 right-3.5 pointer-events-none">
                                                <i className="fa-solid fa-spinner-third animate-spin text-[12px] text-gray-300" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Command.List className="shadow-base overflow-y-auto flex-1 scroll-p-2 outline-none [&>*]:divide-y [&>*]:divide-gray-100">
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
                                            <Command.Group className="p-2">
                                                <CommandItem
                                                    onSelect={() => {
                                                        setPage("ad-accounts");
                                                        setPlaceholder(
                                                            "Search ad account..."
                                                        );
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
                                                    onSelect={() => {
                                                        setPage("campaigns");
                                                        setPlaceholder(
                                                            "Search campaigns..."
                                                        );
                                                    }}
                                                    icon="fa-regular fa-rectangle-history"
                                                >
                                                    Search campaigns
                                                </CommandItem>
                                                <CommandItem
                                                    onSelect={() => {
                                                        setPage("adsets");
                                                        setPlaceholder(
                                                            "Search ad sets..."
                                                        );
                                                    }}
                                                    icon="fa-regular fa-rectangle-history"
                                                >
                                                    Search ad sets
                                                </CommandItem>
                                                <CommandItem
                                                    onSelect={() => {
                                                        setPage("ads");
                                                        setPlaceholder(
                                                            "Search ads..."
                                                        );
                                                    }}
                                                    icon="fa-regular fa-rectangle-history"
                                                >
                                                    Search ads
                                                </CommandItem>
                                                <CommandItem
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
                                            </Command.Group>

                                            <Command.Group className="p-2">
                                                <CommandItem
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
                                                    onSelect={() => {
                                                        setPage("settings");
                                                        setPlaceholder(
                                                            "Search settings..."
                                                        );
                                                    }}
                                                    icon="fa-regular fa-cog"
                                                >
                                                    Settings
                                                </CommandItem>
                                            </Command.Group>

                                            <Command.Group className="p-2">
                                                <CommandItem
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
                                            </Command.Group>
                                        </>
                                    )}

                                    {page === "ad-accounts" && (
                                        <AdAccountSelector />
                                    )}

                                    {page === "settings" && <Settings />}
                                    {page === "campaigns" && <Campaigns />}
                                    {page === "adsets" && <AdSets />}
                                    {page === "ads" && <Ads />}
                                </Command.List>

                                <div className="bg-gray-50 px-4 py-3 shadow-base shrink-0">
                                    <div className="flex items-center justify-end gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="text-[12px] font-semibold text-gray-400">
                                                Jump to
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="h-4 w-4 rounded bg-gray-200/50 ring-1 ring-gray-200/50 flex items-center justify-center text-[11px] font-semibold text-gray-400">
                                                    <i className="fa-solid fa-arrow-turn-down-left text-[8px]" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="text-[12px] font-semibold text-gray-400">
                                                Navigate
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="h-4 w-4 rounded bg-gray-200/50 ring-1 ring-gray-200/50 flex items-center justify-center text-[11px] font-semibold text-gray-400">
                                                    <i className="fa-solid fa-arrow-up text-[8px]" />
                                                </div>
                                                <div className="h-4 w-4 rounded bg-gray-200/50 ring-1 ring-gray-200/50 flex items-center justify-center text-[11px] font-semibold text-gray-400">
                                                    <i className="fa-solid fa-arrow-down text-[8px]" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="text-[12px] font-semibold text-gray-400">
                                                Close menu
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="py-0 px-1 rounded bg-gray-200/50 ring-1 ring-gray-200/50 flex items-center justify-center text-[10px] font-semibold text-gray-400">
                                                    esc
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Command>
                        </div>
                    </motion.div>
                </Ariakit.Dialog>
            )}
        </AnimatePresence>
    );
}
