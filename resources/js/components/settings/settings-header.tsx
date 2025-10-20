import { useSelectedAdAccount } from "@/lib/hooks/use-selected-ad-account";
import { ReactNode } from "react";

interface Props {
    children: ReactNode;
    includeAdAccount?: boolean;
}

export function SettingsHeader({ children, includeAdAccount }: Props) {
    const { selectedAdAccount } = useSelectedAdAccount();

    return (
        <div className="font-semibold flex-1 flex items-center gap-1">
            {includeAdAccount && (
                <span className="text-xs text-gray-400">
                    {selectedAdAccount.name}{" "}
                    <i className="fa-solid fa-angle-right text-[10px] text-gray-300" />
                </span>
            )}
            <span>{children}</span>
        </div>
    );
}
