import { Fragment } from "react/jsx-runtime";
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
            {/* <div className="absolute text-[12px]">
                {JSON.stringify({ selectedItemId })}
            </div> */}

            <div className="flex items-center justify-end gap-4">
                <ShortcutKeyHint label="Close menu" keys={["esc"]} />
                <ShortcutIconHint
                    label="Navigate"
                    keys={[
                        <i className="fa-solid fa-arrow-up text-[8px]" />,
                        <i className="fa-solid fa-arrow-down text-[8px]" />,
                    ]}
                />

                {Array.isArray(action?.keys) && action.keys.length > 0 ? (
                    action.keys.map((key, index) => (
                        <Fragment key={index}>{key}</Fragment>
                    ))
                ) : (
                    <ShortcutIconHint
                        label={action?.label || "Jump to"}
                        keys={[
                            <i className="fa-solid fa-arrow-turn-down-left text-[8px]" />,
                        ]}
                    />
                )}
            </div>
        </div>
    );
}
