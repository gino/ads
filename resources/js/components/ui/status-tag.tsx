import { cn } from "@/lib/cn";
import { useMemo } from "react";

interface Props {
    status: string;
}

export function StatusTag({ status }: Props) {
    const label = useMemo(() => {
        switch (status.toLowerCase()) {
            case "campaign_paused": {
                return "Campaign inactive";
            }
            case "inactive": {
                return "Inactive";
            }
            case "active": {
                return "Campaign inactive";
            }
            default: {
                return "Inactive";
            }
        }
    }, [status]);

    return (
        <div className="inline-flex items-center font-semibold gap-2 text-xs">
            <div
                className={cn(
                    "h-[7px] w-[7px] rounded-full",
                    status === "ACTIVE" ? "bg-brand" : "bg-gray-300 "
                )}
            />
            <span>{label}</span>
        </div>
    );
}
