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
            case "adset_paused": {
                return "Ad set inactive";
            }
            case "inactive": {
                return "Inactive";
            }
            case "in_process": {
                return "Processing";
            }
            case "active": {
                return "Active";
            }
            default: {
                return "Inactive";
            }
        }
    }, [status]);

    const Dot = useMemo(() => {
        switch (status.toLowerCase()) {
            case "active": {
                return (
                    <div className="h-[7px] w-[7px] rounded-full bg-emerald-600" />
                );
            }
            case "inactive": {
                return (
                    <div className="h-[7px] w-[7px] rounded-full bg-gray-300" />
                );
            }
            case "campaign_paused": {
                return (
                    <div className="h-[8px] w-[8px] rounded-full border-2 border-gray-300" />
                );
            }
            case "in_process": {
                return (
                    <div className="h-[8px] w-[8px] rounded-full border-2 border-emerald-600" />
                );
            }
            default: {
                return (
                    <div className="h-[7px] w-[7px] rounded-full bg-gray-300" />
                );
            }
        }
    }, [status]);

    return (
        <div className="inline-flex items-center font-semibold gap-2 text-xs">
            {Dot}
            <span>{label}</span>
        </div>
    );
}
