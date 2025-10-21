import { cn } from "@/lib/cn";
import { useSelectedAdAccount } from "@/lib/hooks/use-selected-ad-account";
import * as Ariakit from "@ariakit/react";
import { router } from "@inertiajs/react";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { CommandItem } from "./command-item";
export function CommandMenu() {
    const [open, setOpen] = useState(false);
    const dialog = Ariakit.useDialogStore({
        open,
        setOpen,
    });

    const { selectedAdAccount } = useSelectedAdAccount();

    useHotkeys(
        ["meta+k", "ctrl+k"],
        () => {
            setOpen((o) => !o);
        },
        [setOpen]
    );

    return (
        <AnimatePresence>
            {open && (
                <Ariakit.Dialog
                    portal
                    store={dialog}
                    alwaysVisible
                    hideOnInteractOutside
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
                                className="flex flex-col h-full min-h-0"
                                loop
                            >
                                <div className="p-2 shrink-0">
                                    <div className="relative">
                                        <Command.Input
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

                                    <Command.Group className="p-2">
                                        {Array(10)
                                            .fill(null)
                                            .map((_, index) => (
                                                <CommandItem
                                                    key={index}
                                                    onSelect={(value) => {
                                                        console.log(
                                                            "yeet " + value
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
                                                setOpen(false);
                                            }}
                                            icon="fa-regular fa-rectangle-history"
                                        >
                                            Switch ad account
                                        </CommandItem>
                                    </Command.Group>

                                    <Command.Group className="p-2">
                                        <CommandItem
                                            onSelect={() => {
                                                setOpen(false);
                                                router.visit(
                                                    route("dashboard.index")
                                                );
                                            }}
                                            icon="fa-regular fa-grid-2"
                                        >
                                            Dashboard
                                        </CommandItem>
                                        <CommandItem
                                            onSelect={() => {
                                                setOpen(false);
                                                router.visit(
                                                    route("dashboard.upload")
                                                );
                                            }}
                                            icon="fa-regular fa-arrow-up-from-bracket"
                                        >
                                            Upload
                                        </CommandItem>
                                        <CommandItem
                                            onSelect={() => {
                                                setOpen(false);
                                                router.visit(
                                                    route("dashboard.campaigns")
                                                );
                                            }}
                                            icon="fa-regular fa-list"
                                        >
                                            Campaigns
                                        </CommandItem>
                                        <CommandItem
                                            onSelect={() => {
                                                setOpen(false);
                                                router.visit(
                                                    route("dashboard.settings")
                                                );
                                            }}
                                            icon="fa-regular fa-cog"
                                        >
                                            Settings
                                        </CommandItem>
                                    </Command.Group>
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
