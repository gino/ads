import { useAuth } from "@/lib/hooks/use-auth";
import { SharedData } from "@/types";
import { usePage } from "@inertiajs/react";
import { useCommandMenu } from "../command-menu/store";
import { AccountPopup } from "./account-popup";
import { AdAccountSelector } from "./ad-account-selector";
import { SidebarItem } from "./sidebar-item";

export function Sidebar() {
    const user = useAuth();

    const { props } = usePage<SharedData>();

    const { setIsOpen: setIsCommandMenuOpen } = useCommandMenu();

    return (
        <aside className="flex overflow-y-auto flex-col gap-3 px-3 py-3 w-72 min-h-0 bg-white">
            <div className="flex-1">
                <div className="mb-3">
                    <AdAccountSelector adAccounts={props.adAccounts} />
                </div>

                <div className="space-y-2">
                    <SidebarItem
                        icon="fa-search"
                        suffix={
                            <div className="flex items-center gap-px text-[14px] font-semibold text-gray-400">
                                <i className="fa-solid fa-command text-[9px]" />
                                <span>K</span>
                            </div>
                        }
                        onClick={() => {
                            setIsCommandMenuOpen((o) => !o);
                        }}
                        className="bg-gray-50 ring-1 ring-gray-50 hover:ring-gray-100"
                    >
                        Search
                    </SidebarItem>
                    <SidebarItem icon="fa-grid-2" href="dashboard.index">
                        Dashboard
                    </SidebarItem>
                    <SidebarItem
                        icon="fa-arrow-up-from-bracket"
                        href="dashboard.upload"
                    >
                        Upload
                    </SidebarItem>
                    <SidebarItem icon="fa-list" href="dashboard.campaigns">
                        Campaigns
                    </SidebarItem>
                    <SidebarItem
                        icon="fa-chart-simple"
                        suffix={
                            <span className="font-semibold bg-gray-100 text-[12px] px-2 leading-5 group-enabled:group-hover:bg-gray-200 rounded-full">
                                Coming soon
                            </span>
                        }
                        disabled
                    >
                        Analytics
                    </SidebarItem>
                    {/* <SidebarItem icon="fa-circle-nodes">Events</SidebarItem> */}
                    <SidebarItem icon="fa-cog" href="dashboard.settings">
                        Settings
                    </SidebarItem>
                </div>
            </div>
            <div className="flex flex-col gap-3">
                <AccountPopup />
            </div>
        </aside>
    );
}
