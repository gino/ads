import { useAuth } from "@/lib/hooks/use-auth";
import * as Ariakit from "@ariakit/react";
import { router } from "@inertiajs/react";
import { useState } from "react";
import { useCommandMenu } from "../command-menu/store";

export function AccountPopup() {
    const user = useAuth();

    const { setIsOpen: setCommandMenuIsOpen } = useCommandMenu();
    const [isOpen, setIsOpen] = useState(false);

    const store = Ariakit.useMenuStore({
        open: isOpen,
        setOpen: setIsOpen,
    });

    return (
        <Ariakit.MenuProvider focusLoop store={store} placement="top">
            <Ariakit.MenuButton
                render={(props) => (
                    <button
                        className="flex gap-3 enabled:active:scale-[0.99] transition-transform duration-100 ease-in-out items-center px-3 py-2.5 w-full text-left rounded-lg ring-1 ring-gray-100 hover:bg-gray-100 cursor-pointer"
                        {...props}
                    >
                        <img
                            src={user.avatar}
                            className="object-cover object-center w-8 h-8 rounded-full"
                        />
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
                    <div>Notifications</div>
                </Ariakit.MenuItem>

                <div className="bg-gray-100 h-px my-1 -mx-1" />

                <Ariakit.MenuItem
                    onClick={() => {
                        setIsOpen(false);
                        setCommandMenuIsOpen(true);
                    }}
                    className="flex items-center outline-none data-[active-item='true']:bg-gray-100 data-[disabled='true']:opacity-50 data-[disabled='true']:cursor-not-allowed group px-4 py-3 text-sm rounded-lg cursor-pointer font-semibold truncate"
                >
                    <div>Command menu</div>
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
