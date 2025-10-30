import { useAuth } from "@/lib/hooks/use-auth";
import * as Ariakit from "@ariakit/react";
import { router } from "@inertiajs/react";
import { useState } from "react";

export function AccountPopup() {
    const user = useAuth();

    const [isOpen, setIsOpen] = useState(false);

    const store = Ariakit.useMenuStore({
        open: isOpen,
        setOpen: setIsOpen,
    });

    const [notifications, setNotifications] = useState(0);

    return (
        <Ariakit.MenuProvider focusLoop store={store} placement="top">
            <Ariakit.MenuButton
                render={(props) => (
                    <button
                        className="flex gap-3 enabled:active:scale-[0.99] group transition-transform duration-100 ease-in-out items-center px-3 py-2.5 w-full text-left rounded-lg ring-1 ring-gray-100 hover:bg-gray-100 cursor-pointer"
                        {...props}
                    >
                        <div className="relative rounded-full w-8 h-8 after:absolute after:inset-0 after:ring-1 after:ring-inset after:rounded-[inherit] after:ring-black/5">
                            <img
                                src={user.avatar}
                                className="object-cover object-center w-full h-full rounded-[inherit]"
                            />

                            {notifications > 0 && (
                                <div className="absolute -top-px -right-px z-10">
                                    <div className="h-2 w-2 bg-red-700 rounded-full ring-2 ring-white group-hover:ring-gray-100" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-semibold">
                                {user.name}
                            </div>
                            <div className="text-xs font-medium text-gray-500">
                                Free plan
                            </div>
                        </div>
                        <i className="fa-solid fa-ellipsis-v text-gray-400" />
                    </button>
                )}
            />

            <Ariakit.Menu
                gutter={8}
                portal
                sameWidth
                unmountOnHide
                hideOnInteractOutside
                slide={false}
                className="rounded-xl outline-none bg-white shadow-base-popup p-1 space-y-1 max-h-[var(--popover-available-height)] overflow-y-auto"
            >
                <Ariakit.MenuItem
                    onClick={() => {
                        setIsOpen(false);
                        router.visit(route("dashboard.settings.account"));
                    }}
                    className="flex items-center outline-none data-[active-item='true']:bg-gray-100 data-[disabled='true']:opacity-50 data-[disabled='true']:cursor-not-allowed group px-4 py-3 text-sm rounded-lg cursor-pointer font-semibold truncate"
                >
                    <div>Account</div>
                </Ariakit.MenuItem>

                <Ariakit.MenuItem
                    onClick={() => {
                        setIsOpen(false);
                        router.visit(route("dashboard.settings.account"));
                    }}
                    className="flex items-center outline-none data-[active-item='true']:bg-gray-100 data-[disabled='true']:opacity-50 data-[disabled='true']:cursor-not-allowed group px-4 py-3 text-sm rounded-lg cursor-pointer font-semibold truncate"
                >
                    <div className="flex-1 truncate">Billing</div>
                    <span className="font-semibold bg-gray-100 text-[12px] px-2 leading-5 group-data-[active-item='true']:bg-gray-200 rounded-full">
                        Free
                    </span>
                </Ariakit.MenuItem>

                <Ariakit.MenuItem
                    onClick={() => {
                        setIsOpen(false);
                        router.visit(route("dashboard.settings.account"));
                    }}
                    className="flex items-center outline-none data-[active-item='true']:bg-gray-100 data-[disabled='true']:opacity-50 data-[disabled='true']:cursor-not-allowed group px-4 py-3 text-sm rounded-lg cursor-pointer font-semibold truncate"
                >
                    <div className="flex-1 truncate">Notifications</div>
                    {notifications > 0 && (
                        <span className="font-semibold bg-red-700 text-white flex items-center text-center text-[12px] px-2 leading-5 rounded-full">
                            {notifications}
                        </span>
                    )}
                </Ariakit.MenuItem>

                <div className="bg-gray-100 h-px my-1 -mx-1" />

                <Ariakit.MenuItem className="flex items-center outline-none data-[active-item='true']:bg-gray-100 data-[disabled='true']:opacity-50 data-[disabled='true']:cursor-not-allowed group px-4 py-3 text-sm rounded-lg cursor-pointer font-semibold truncate">
                    <div>Support</div>
                </Ariakit.MenuItem>

                <div className="bg-gray-100 h-px my-1 -mx-1" />

                <Ariakit.MenuItem
                    onClick={() => {
                        setIsOpen(false);
                        router.post(route("logout"));
                    }}
                    className="flex items-center outline-none data-[active-item='true']:bg-red-900/5 data-[disabled='true']:opacity-50 data-[disabled='true']:cursor-not-allowed group px-4 py-3 text-sm rounded-lg cursor-pointer font-semibold truncate"
                >
                    <div className="text-red-800">Log out</div>
                </Ariakit.MenuItem>
            </Ariakit.Menu>
        </Ariakit.MenuProvider>
    );
}
