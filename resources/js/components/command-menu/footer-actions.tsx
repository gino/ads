import { ShortcutButtonHint } from "./components/shortcut-hint";
import { AdSetContextMenu } from "./pages/ad-sets";
import { CampaignContextMenu } from "./pages/campaigns";

// https://chatgpt.com/c/68f9e6df-9c40-8328-8fab-ffeec76a6b27
export const footerActions = {
    "ad-account-item": {
        label: "Switch to",
        keys: [],
    },
    "campaign-item": {
        label: "Actions",
        keys: [<CampaignContextMenu />],
    },
    "adset-item": {
        label: "Actions",
        keys: [<AdSetContextMenu />],
    },
    "ad-item": {
        label: "Actions",
        keys: [
            <ShortcutButtonHint
                label="Actions"
                keys={[
                    <i className="fa-solid fa-command text-[8px]" />,
                    <span>K</span>,
                ]}
            />,
        ],
    },
} as const;
