import { cn } from "@/lib/cn";
import { UploadedCreative } from "@/pages/upload";
import { useDraggable } from "@dnd-kit/core";
import { FolderType } from "./adset-group";
import { useUploadContext } from "./upload-context";
import { useUploadedCreativesContext } from "./uploaded-creatives";

interface Props {
    creative: UploadedCreative;
    type?: FolderType;
    className?: string;
    isDraggingCreative?: boolean;
}

export function AdCreative({
    creative,
    type = "ADSET",
    isDraggingCreative,
    className,
}: Props) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({
            id: creative.id,
        });

    const { deleteCreative } = useUploadContext();
    const { deleteFromGroup } = useUploadedCreativesContext();

    return (
        <div
            className={cn(
                "rounded-lg",
                isDraggingCreative && "ring-2 ring-offset-3 ring-blue-100 "
            )}
        >
            <div
                ref={setNodeRef}
                style={{
                    transform: transform
                        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
                        : undefined,
                    opacity: isDragging ? 0 : 1,
                }}
                className={cn(
                    "bg-white rounded-lg px-3 py-3 gap-3 flex items-center cursor-grab shadow-base shrink-0",
                    className
                )}
                {...listeners}
                {...attributes}
            >
                <i className="fa-solid fa-grip-dots-vertical text-[10px] text-gray-300" />

                <div className="h-12 w-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    {creative.thumbnail !== null ? (
                        <div className="relative after:absolute after:inset-0 after:ring-1 after:ring-inset after:rounded-lg after:ring-black/5 h-full w-full">
                            <img
                                src={creative.thumbnail}
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
                                    : creative.type.startsWith("image/")
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
                        <div>{creative.type.split("/")[1].toUpperCase()}</div>
                    </div>
                </div>

                {!isDraggingCreative && (
                    <div
                        onPointerDown={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 pointer-events-auto"
                    >
                        <button className="h-8 w-8 flex items-center justify-center cursor-pointer hover:shadow-base rounded-lg active:scale-[0.99] transition-[transform,color] duration-100 ease-in-out text-gray-400 hover:text-black hover:bg-white">
                            <i className="fa-regular fa-pencil" />
                        </button>
                        {type === "UNGROUPED" && (
                            <button className="h-8 w-8 flex items-center justify-center cursor-pointer hover:shadow-base rounded-lg active:scale-[0.99] transition-[transform,color] duration-100 ease-in-out text-gray-400 hover:text-black hover:bg-white">
                                <i className="fa-regular fa-folder-plus" />
                            </button>
                        )}
                        {type === "ADSET" && (
                            <button
                                onClick={() => deleteFromGroup(creative.id)}
                                className="h-8 w-8 flex items-center justify-center cursor-pointer hover:shadow-base rounded-lg active:scale-[0.99] transition-[transform,color] duration-100 ease-in-out text-gray-400 hover:text-black hover:bg-white"
                            >
                                <i className="fa-regular fa-folder-xmark" />
                            </button>
                        )}
                        <button
                            onClick={() => {
                                deleteCreative(creative.id);
                            }}
                            className="h-8 w-8 flex items-center justify-center cursor-pointer hover:shadow-base rounded-lg active:scale-[0.99] transition-[transform,color] duration-100 ease-in-out text-gray-400 hover:text-red-700 hover:bg-white"
                        >
                            <i className="fa-regular fa-trash-can" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
