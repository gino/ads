import { useSelectedAdAccount } from "@/lib/hooks/use-selected-ad-account";
import { ReactNode } from "react";

interface Props {
    children: ReactNode;
    includeAdAccount?: boolean;
}

export function SettingsHeader({ children, includeAdAccount }: Props) {
    const { selectedAdAccount } = useSelectedAdAccount();

    return (
        <div className="font-semibold flex-1 flex items-center gap-2">
            {includeAdAccount && (
                <>
                    <div className="text-xs text-gray-400 flex items-center">
                        {selectedAdAccount.name}{" "}
                    </div>
                    <div className="text-gray-300">/</div>
                </>
            )}
            <span>{children}</span>
        </div>
    );
}
