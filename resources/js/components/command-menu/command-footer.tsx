import { Portal } from "@ariakit/react";
import { PropsWithChildren } from "react";
import { ShortcutIconHint, ShortcutKeyHint } from "./components/shortcut-hint";
import { footerActions } from "./footer-actions";
import { useCommandMenu } from "./store";

export function CommandFooter() {
    const { selectedItemId } = useCommandMenu();

    // https://chatgpt.com/c/68f9e6df-9c40-8328-8fab-ffeec76a6b27
    const action = selectedItemId
        ? footerActions[selectedItemId as keyof typeof footerActions]
        : null;

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
