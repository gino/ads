import { Portal } from "@ariakit/react";
import { PropsWithChildren } from "react";
import { ShortcutIconHint, ShortcutKeyHint } from "./shortcut-hint";

export function CommandFooter() {
    return (
        <div className="bg-gray-50 px-4 py-3 shadow-base shrink-0 relative">
            <div className="flex items-center justify-end gap-4">
                <ShortcutKeyHint label="Close menu" keys={["esc"]} />
                <ShortcutIconHint
                    label="Navigate"
                    keys={[
                        <i className="fa-solid fa-arrow-up text-[8px]" />,
                        <i className="fa-solid fa-arrow-down text-[8px]" />,
                    ]}
                />
                <div id="command-footer-actions" className="empty:hidden" />
            </div>
        </div>
    );
}

export function CommandFooterPortal({ children }: PropsWithChildren) {
    const portalElement = document.getElementById("command-footer-actions")!;
    return <Portal portalElement={portalElement}>{children}</Portal>;
}
