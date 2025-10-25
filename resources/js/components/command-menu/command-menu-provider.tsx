import { HotkeysProvider } from "react-hotkeys-hook";
import { CommandMenu } from "./command-menu";

export function CommandMenuProvider() {
    return <CommandMenu />;

    return (
        <HotkeysProvider initiallyActiveScopes={["command-menu"]}>
            <CommandMenu />
        </HotkeysProvider>
    );
}
