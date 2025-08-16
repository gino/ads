import { cn } from "@/lib/cn";

interface Props {
    children: string;
    status: string;
}

export function StatusTag({ children, status }: Props) {
    return (
        <div className="inline-flex items-center font-semibold gap-2 text-xs">
            <div
                className={cn(
                    "h-[7px] w-[7px] rounded-full",
                    status === "ACTIVE" ? "bg-brand" : "bg-gray-300 "
                )}
            />
            <span className="capitalize">Inactive</span>
        </div>
    );
}
