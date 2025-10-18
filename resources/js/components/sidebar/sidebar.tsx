import { useAuth } from "@/lib/hooks/use-auth";
import { SharedData } from "@/types";
import { usePage } from "@inertiajs/react";
import { AdAccountSelector } from "./ad-account-selector";
import { SidebarItem } from "./sidebar-item";

export function Sidebar() {
    const user = useAuth();

    const { props } = usePage<SharedData>();

    return (
        <aside className="flex overflow-y-auto flex-col gap-3 px-3 py-3 w-72 min-h-0 bg-white">
            <div className="flex-1">
                <div className="mb-3">
                    <AdAccountSelector adAccounts={props.adAccounts} />
                </div>

                <div className="space-y-2">
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
                    <SidebarItem icon="fa-circle-nodes">Events</SidebarItem>
                    <SidebarItem icon="fa-cog" href="dashboard.settings">
                        Settings
                    </SidebarItem>
                </div>
            </div>
            <div className="flex flex-col gap-3">
                <button className="flex gap-3 enabled:active:scale-[0.99] transition-transform duration-100 ease-in-out items-center px-3 py-2.5 w-full text-left rounded-lg ring-1 ring-gray-100 hover:bg-gray-100 cursor-pointer">
                    <img
                        src={user.avatar}
                        className="object-cover object-center w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                        <div className="text-sm font-semibold">{user.name}</div>
                        <div className="text-xs font-medium text-gray-500">
                            Free plan
                        </div>
                    </div>
                    <i className="fa-solid fa-ellipsis-v text-gray-400" />
                </button>
            </div>
        </aside>
    );
}
