import { cn } from "@/lib/cn";
import { UploadedCreative } from "@/pages/upload";

type FolderType = "ADSET" | "UNGROUPED";

interface Props {
    label: string;
    type: FolderType;
    creatives: UploadedCreative[];
    className?: string;
}

export function AdSet({ label, type, creatives, className }: Props) {
    return (
        <div
            className={cn(
                "bg-gray-50 ring-inset ring-1 ring-gray-200/30 rounded-xl",
                className
            )}
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
                        <div
                            key={creative.id}
                            className="bg-white shadow-base rounded-lg px-3 py-3 gap-3 flex items-center cursor-grab"
                        >
                            <i className="fa-solid fa-grip-dots-vertical text-[10px] text-gray-300" />

                            <div className="h-12 w-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                {creative.thumbnail !== null ? (
                                    <div className="relative after:absolute after:inset-0 after:ring-1 after:ring-inset after:rounded-lg after:ring-black/5 h-full w-full">
                                        <img
                                            src={creative.thumbnail}
                                            onLoad={() => {
                                                URL.revokeObjectURL(
                                                    creative.thumbnail!
                                                );
                                            }}
                                            className="h-full w-full object-center object-cover"
                                        />
                                    </div>
                                ) : (
                                    <i className="fa-regular fa-file" />
                                )}
                            </div>

                            <div className="flex-1 truncate">
                                <div className="flex items-center mb-0.5 gap-1.5 truncate">
                                    <i
                                        className={cn(
                                            "fa-regular text-[12px] shrink-0",
                                            creative.type.startsWith("video/")
                                                ? "fa-video"
                                                : creative.type.startsWith(
                                                      "image/"
                                                  )
                                                ? "fa-image"
                                                : "fa-file"
                                        )}
                                    />
                                    <div className="font-semibold truncate">
                                        {creative.name}
                                    </div>
                                </div>
                                <div className="text-[12px] font-medium text-gray-500 flex items-center gap-1.5">
                                    <div>{creative.size}</div>
                                    <div className="text-gray-300">&bull;</div>
                                    <div>
                                        {creative.type
                                            .split("/")[1]
                                            .toUpperCase()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <button className="h-8 w-8 flex items-center justify-center cursor-pointer hover:shadow-base rounded-lg active:scale-[0.99] transition-[transform,color] duration-100 ease-in-out text-gray-400 hover:text-black hover:bg-white">
                                    <i className="fa-regular fa-pencil" />
                                </button>
                                {type === "UNGROUPED" && (
                                    <button className="h-8 w-8 flex items-center justify-center cursor-pointer hover:shadow-base rounded-lg active:scale-[0.99] transition-[transform,color] duration-100 ease-in-out text-gray-400 hover:text-black hover:bg-white">
                                        <i className="fa-regular fa-folder-plus" />
                                    </button>
                                )}
                                <button className="h-8 w-8 flex items-center justify-center cursor-pointer hover:shadow-base rounded-lg active:scale-[0.99] transition-[transform,color] duration-100 ease-in-out text-gray-400 hover:text-red-700 hover:bg-white">
                                    <i className="fa-regular fa-trash-can" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
