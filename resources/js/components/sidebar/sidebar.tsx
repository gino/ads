import { useAuth } from "@/lib/hooks/useAuth";
import { AdAccountSelector } from "./ad-account-selector";

interface Props {
    adAccounts: App.Data.AdAccountData[];
}

export function Sidebar({ adAccounts }: Props) {
    const user = useAuth();

    return (
        <aside className="flex overflow-y-auto flex-col gap-4 p-3 w-72 min-h-0 shadow-base bg-white">
            <div className="flex-1">
                <div className="mb-4">
                    <AdAccountSelector adAccounts={adAccounts} />
                </div>

                <div className="space-y-2">
                    <button className="px-3 cursor-pointer py-2.5 flex rounded-lg group w-full items-center gap-3 font-semibold bg-neutral-100 ring-1 ring-neutral-100">
                        <i className="text-base fa-regular fa-grid-2 fa-fw" />
                        <span>Dashboard</span>
                    </button>

                    <button className="px-3 cursor-pointer py-2.5 flex rounded-lg group w-full items-center gap-3 font-semibold hover:bg-neutral-100 hover:ring-1 ring-neutral-100">
                        <i className="text-base fa-regular fa-arrow-up-from-bracket fa-fw text-neutral-400 group-hover:text-black" />
                        <span className="text-neutral-600 group-hover:text-black">
                            Upload
                        </span>
                    </button>

                    <button className="px-3 cursor-pointer py-2.5 flex rounded-lg group w-full items-center gap-3 font-semibold hover:bg-neutral-100 hover:ring-1 ring-neutral-100">
                        <i className="text-base fa-regular fa-list fa-fw text-neutral-400 group-hover:text-black" />
                        <span className="text-neutral-600 group-hover:text-black">
                            Campaigns
                        </span>
                    </button>

                    <button className="px-3 cursor-pointer py-2.5 flex rounded-lg group w-full items-center gap-3 font-semibold hover:bg-neutral-100 hover:ring-1 ring-neutral-100">
                        <i className="text-base fa-regular fa-chart-simple fa-fw text-neutral-400 group-hover:text-black" />
                        <span className="text-neutral-600 group-hover:text-black">
                            Analytics
                        </span>
                    </button>

                    <button className="px-3 cursor-pointer py-2.5 flex rounded-lg group w-full items-center gap-3 font-semibold hover:bg-neutral-100 hover:ring-1 ring-neutral-100">
                        <i className="text-base fa-regular fa-cog fa-fw text-neutral-400 group-hover:text-black" />
                        <span className="text-neutral-600 group-hover:text-black">
                            Settings
                        </span>
                    </button>
                </div>
            </div>
            <div>
                <button className="flex gap-3 items-center px-3 py-2.5 w-full text-left rounded-lg ring-1 ring-neutral-100 hover:bg-neutral-100 cursor-pointer">
                    <img
                        src={user.avatar}
                        className="object-cover object-center w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                        <div className="text-sm font-semibold">{user.name}</div>
                        <div className="text-xs font-medium text-neutral-500">
                            {user.email}
                        </div>
                    </div>
                    <i className="fa-solid fa-ellipsis-v text-neutral-400" />
                </button>
            </div>
        </aside>
    );
}
