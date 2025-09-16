import { cn } from "@/lib/cn";
import { useDroppable } from "@dnd-kit/core";
import { useMemo } from "react";
import { AdCreative } from "./ad-creative";
import { useUploadContext } from "./upload-context";

export type FolderType = "ADSET" | "UNGROUPED";

interface Props {
    label: string;
    id: string | "ungrouped";
    type: FolderType;
    creativeIds: string[];
    className?: string;
}

export function AdSetGroup({ id, label, type, creativeIds, className }: Props) {
    const { isOver, setNodeRef } = useDroppable({
        id,
    });

    const { form } = useUploadContext();

    const creatives = useMemo(() => {
        return form.data.creatives.filter((creative) => {
            return creativeIds.includes(creative.id);
        });
    }, [form.data.creatives, creativeIds]);

    return (
        <div
            className={cn(
                "rounded-xl",
                isOver && "ring-2 ring-offset-2 ring-blue-100",
                className
            )}
        >
            <div
                ref={setNodeRef}
                className="bg-gray-50 ring-inset ring-1 ring-gray-200/30 rounded-xl"
            >
                <div className="flex px-3 items-center h-12">
                    <div className="flex items-center gap-2 flex-1">
                        <i className="fa-regular fa-angle-down text-gray-300" />
                        <div className="flex items-center gap-2.5">
                            {type === "ADSET" && (
                                <i className="fa-regular text-gray-400 fa-folder" />
                            )}
                            <div className="font-semibold">{label}</div>
                        </div>
                    </div>

                    <div className="flex items-center relative">
                        <div className="font-semibold bg-gray-200/50 text-[12px] px-2 inline-block rounded-full leading-5">
                            {creatives.length} creative
                            {creatives.length === 1 ? "" : "s"}
                        </div>

                        {type === "ADSET" && (
                            <>
                                <div className="w-px h-4 bg-gray-200/50 mx-3" />
                                <div className="flex items-center gap-1">
                                    <button className="cursor-pointer active:scale-[0.99] transition-transform duration-100 ease-in-out hover:bg-gray-200/50 text-gray-400 hover:text-black h-6 w-6 text-[12px] flex items-center justify-center rounded-[5px]">
                                        <i className="fa-regular fa-cog" />
                                    </button>
                                    <button className="cursor-pointer active:scale-[0.99] transition-transform duration-100 ease-in-out hover:bg-gray-200/50 text-gray-400 hover:text-black h-6 w-6 text-[12px] flex items-center justify-center rounded-[5px]">
                                        <i className="fa-regular fa-clone" />
                                    </button>
                                    <button className="cursor-pointer active:scale-[0.99] transition-transform duration-100 ease-in-out hover:bg-gray-200/50 text-gray-400 hover:text-red-700 h-6 w-6 text-[12px] flex items-center justify-center rounded-[5px]">
                                        <i className="fa-regular fa-trash-can" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {creatives.length > 0 && (
                    <div className="flex flex-col gap-2 p-2 -mt-2">
                        {creatives.map((creative) => (
                            <AdCreative
                                key={creative.id}
                                creative={creative}
                                type={type}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
