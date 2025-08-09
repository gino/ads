import { cn } from "@/lib/cn";
import { useSelectedAdAccount } from "@/lib/hooks/useSelectedAdAccount";
import * as Ariakit from "@ariakit/react";
import { useState } from "react";

interface Props {
    adAccounts: App.Data.AdAccountData[];
}

export function AdAccountSelector({ adAccounts }: Props) {
    const { selectedAdAccountId, selectAdAccount } = useSelectedAdAccount();

    const renderValue = (id: string) => {
        const adAccount = adAccounts.find((adAccount) => adAccount.id === id)!;

        return (
            <div
                title={`${adAccount.name} (${adAccount.currency})`}
                className="flex items-center w-full mr-6 relative"
            >
                <div className="absolute flex left-0 top-1/2 -translate-y-1/2">
                    <div className="flex justify-center items-center w-6 h-6 text-[12px] font-bold bg-blue-600/5 rounded text-blue-950 mr-3">
                        {adAccount.name[0].toUpperCase()}
                    </div>
                </div>
                <div className="max-w-36 text-left ml-[34px] truncate">
                    {adAccount.name}
                </div>
                <div className="absolute flex right-0 top-1/2 -translate-y-1/2">
                    <span className="font-semibold bg-gray-100 text-[12px] px-2 inline-block rounded-full text-gray-800 leading-5">
                        {adAccount.currency}
                    </span>
                </div>
            </div>
        );
    };

    const [value, setValue] = useState(selectedAdAccountId);
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Ariakit.SelectProvider
            value={value}
            open={isOpen}
            setOpen={(value) => setIsOpen(value)}
            setValue={(value) => {
                setValue(value);
                selectAdAccount(value);
            }}
        >
            <Ariakit.Select className="cursor-pointer px-2.5 py-2.5 font-semibold shadow-base text-sm rounded-lg active:scale-[0.99] transition-transform duration-100 ease-in-out w-full relative flex items-center">
                <Ariakit.SelectValue fallback="">
                    {(value) => renderValue(value)}
                </Ariakit.SelectValue>
                <Ariakit.SelectArrow className="absolute right-3 pointer-events-none text-xs top-1/2 -translate-y-1/2 !h-[unset] !w-[unset]">
                    <i
                        className={cn(
                            "fa-solid fa-angle-down text-gray-400 transition-transform duration-200 ease-in-out",
                            isOpen && "rotate-180"
                        )}
                    />
                </Ariakit.SelectArrow>
            </Ariakit.Select>
            <Ariakit.SelectPopover
                gutter={8}
                sameWidth
                className="bg-red-100 p-1"
            >
                {adAccounts.map((adAccount) => (
                    <Ariakit.SelectItem
                        key={adAccount.id}
                        value={adAccount.id}
                        className="hover:bg-red-200 cursor-pointer"
                    >
                        {adAccount.name}
                    </Ariakit.SelectItem>
                ))}
            </Ariakit.SelectPopover>
        </Ariakit.SelectProvider>
    );
}
