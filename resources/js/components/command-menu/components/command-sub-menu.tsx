import * as Ariakit from "@ariakit/react";
import { RenderProp } from "@ariakit/react-core/utils/types";
import { AnimatePresence, motion } from "motion/react";
import { ReactNode, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";

interface Props {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    disclosure: RenderProp;
    children: ReactNode;
}

export function CommandSubMenu({
    isOpen,
    setIsOpen,
    disclosure,
    children,
}: Props) {
    useHotkeys(
        ["meta+k", "ctrl+k"],
        () => {
            setIsOpen(!isOpen);
        },
        [setIsOpen, isOpen],
        {
            preventDefault: true,
            enableOnFormTags: true,
        }
    );

    useEffect(() => {
        if (isOpen) {
            document.body.style.pointerEvents = "none";
        } else {
            document.body.style.pointerEvents = "";
        }

        return () => {
            document.body.style.pointerEvents = "";
        };
    }, [isOpen]);

    const store = Ariakit.usePopoverStore({
        open: isOpen,
        setOpen: setIsOpen,
    });

    return (
        <Ariakit.PopoverProvider store={store} placement="top-end">
            <Ariakit.PopoverDisclosure render={disclosure} />

            <Ariakit.Popover
                store={store}
                portal
                gutter={18}
                alwaysVisible
                autoFocusOnHide
                finalFocus={
                    document.querySelector("input[cmdk-input]") as HTMLElement
                }
                className="z-50 w-80 pointer-events-auto"
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
                            {children}
                        </motion.div>
                    )}
                </AnimatePresence>
            </Ariakit.Popover>
        </Ariakit.PopoverProvider>
    );
}
