import { cn } from "@/lib/cn";
import { UploadedCreative } from "@/pages/upload";
import { useDraggable } from "@dnd-kit/core";
import { FolderType } from "./adset-group";

interface Props {
    creative: UploadedCreative;
    type: FolderType;
}

export function Creative({ creative, type }: Props) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: creative.id,
    });
    const style = transform
        ? {
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          }
        : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="bg-white shadow-base rounded-lg px-3 py-3 gap-3 flex items-center cursor-grab"
        >
            <i className="fa-solid fa-grip-dots-vertical text-[10px] text-gray-300" />

            <div className="h-12 w-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                {creative.thumbnail !== null ? (
                    <div className="relative after:absolute after:inset-0 after:ring-1 after:ring-inset after:rounded-lg after:ring-black/5 h-full w-full">
                        <img
                            src={creative.thumbnail}
                            onLoad={() => {
                                URL.revokeObjectURL(creative.thumbnail!);
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
    );
}
