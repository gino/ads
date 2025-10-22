import { cn } from "@/lib/cn";
import * as Ariakit from "@ariakit/react";
import { router } from "@inertiajs/react";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "motion/react";
import { useHotkeys } from "react-hotkeys-hook";
import { CommandItem } from "./command-item";
import { AdAccountSelector } from "./pages/ad-account-selector";
import { useCommandMenu } from "./store";

export type CommandMenuPage = "index" | "ad-accounts";

export function CommandMenu() {
    const { isOpen, setIsOpen, page, setPage, search, setSearch } =
        useCommandMenu();

    const dialog = Ariakit.useDialogStore({
        open: isOpen,
        setOpen: (value) => {
            setIsOpen(value);
            setPage("index");
            setSearch("");
        },
    });

    useHotkeys(
        ["meta+k", "ctrl+k", "Slash"],
        () => {
            setIsOpen((o) => !o);
        },
        [setIsOpen],
        { preventDefault: true }
    );

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
                            transition={{ duration: 0.15, ease: "easeInOut" }}
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
                            translateY: 8,
                            filter: "blur(1px)",
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            translateY: 0,
                            filter: "blur(0px)",
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.98,
                            translateY: 8,
                            filter: "blur(1px)",
                        }}
                        transition={{
                            duration: 0.15,
                            ease: "easeInOut",
                        }}
                        className="w-full shadow-xs bg-white/60 p-2 rounded-3xl backdrop-blur-[1px] flex flex-col h-full min-h-0 origin-bottom ring-1 ring-black/10"
                    >
                        <div className="overflow-hidden w-full bg-white rounded-2xl shadow-dialog flex flex-col h-full min-h-0 ring-1 ring-black/5">
                            <Command
                                onKeyDown={(e) => {
                                    if (e.key === "Backspace" && !search) {
                                        e.preventDefault();
                                        setPage("index");
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
                                            placeholder="Type a command or search..."
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <Command.List className="shadow-base overflow-y-auto flex-1 scroll-p-2 outline-none [&>*]:divide-y [&>*]:divide-gray-100">
                                    <Command.Empty className="text-center py-10">
                                        <div className="font-semibold mb-1">
                                            No results found
                                        </div>
                                        <div className="text-xs font-medium text-gray-500">
                                            We couldn't find any resources or
                                            commands matching your search.
                                        </div>
                                    </Command.Empty>

                                    {page === "index" && (
                                        <>
                                            <Command.Group className="p-2">
                                                {Array(10)
                                                    .fill(null)
                                                    .map((_, index) => (
                                                        <CommandItem
                                                            key={index}
                                                            onSelect={(
                                                                value
                                                            ) => {
                                                                console.log(
                                                                    "yeet " +
                                                                        value
                                                                );
                                                            }}
                                                            icon="fa-regular fa-arrow-right"
                                                        >
                                                            Item {index + 1}
                                                        </CommandItem>
                                                    ))}
                                            </Command.Group>

                                            <Command.Group className="p-2">
                                                <CommandItem
                                                    onSelect={() => {
                                                        setSearch("");
                                                        setPage("ad-accounts");
                                                    }}
                                                    icon="fa-regular fa-rectangle-history"
                                                >
                                                    Switch ad account
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
                                                        setIsOpen(false);
                                                        router.visit(
                                                            route(
                                                                "dashboard.settings"
                                                            )
                                                        );
                                                    }}
                                                    icon="fa-regular fa-cog"
                                                >
                                                    Settings
                                                </CommandItem>
                                            </Command.Group>
                                        </>
                                    )}

                                    {page === "ad-accounts" && (
                                        <AdAccountSelector />
                                    )}
                                </Command.List>

                                <div className="bg-gray-50 h-8 shadow-base shrink-0"></div>
                            </Command>
                        </div>
                    </motion.div>
                </Ariakit.Dialog>
            )}
        </AnimatePresence>
    );
}
