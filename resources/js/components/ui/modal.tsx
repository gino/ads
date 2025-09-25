import * as Ariakit from "@ariakit/react";
import { AnimatePresence, motion } from "motion/react";
import { ReactNode } from "react";

interface Props {
    open: boolean;
    setOpen: (value: boolean) => void;
    children: ReactNode;
    hideOnInteractOutside?: boolean;
}

export function Modal({
    open,
    setOpen,
    children,
    hideOnInteractOutside = true,
}: Props) {
    const dialog = Ariakit.useDialogStore({
        open,
        setOpen,
    });
    const mounted = Ariakit.useStoreState(dialog, "mounted");

    return (
        <AnimatePresence>
            {mounted && (
                <Ariakit.Dialog
                    store={dialog}
                    portal
                    alwaysVisible
                    hideOnInteractOutside={hideOnInteractOutside}
                    autoFocusOnShow={false}
                    render={(props) => (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            hidden={!open}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="fixed inset-0 bg-black/10 flex items-center justify-center"
                        >
                            <div {...props} />
                        </motion.div>
                    )}
                    className="max-w-lg w-full flex flex-col max-h-[var(--dialog-viewport-height)] py-4 outline-none"
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
                            duration: 0.2,
                            ease: "easeInOut",
                        }}
                        className="w-full shadow-xs bg-white/60 p-2 rounded-3xl backdrop-blur-[1px] flex flex-col h-full min-h-0 origin-bottom"
                    >
                        <div className="bg-white w-full rounded-2xl shadow-dialog overflow-hidden divide-y divide-gray-100">
                            <div className="overflow-y-auto">{children}</div>
                        </div>
                    </motion.div>
                </Ariakit.Dialog>
            )}
        </AnimatePresence>
    );
}
