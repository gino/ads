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
            case "in_process": {
                return "Processing";
            }
            case "active": {
                return "Campaign inactive";
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
                    <div className="h-[7px] w-[7px] rounded-full bg-brand" />
                );
            }
            case "in_process": {
                return (
                    <div className="h-[8px] w-[8px] rounded-full border-2 border-gray-300" />
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
