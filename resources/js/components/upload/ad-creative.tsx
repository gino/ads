import { cn } from "@/lib/cn";
import { UploadedCreative } from "@/pages/upload";
import { useDraggable } from "@dnd-kit/core";
import { useCallback, useMemo, useState } from "react";
import { FolderType } from "./adset-group";
import { useUploadContext } from "./upload-context";
import { useUploadedCreativesContext } from "./uploaded-creatives";

export const HEIGHT = 72;

interface Props {
    creative: UploadedCreative;
    type?: FolderType;
    className?: string;
    isDraggingCreative?: boolean;
    hoveringAdSetId?: string | null;
}

export function AdCreative({
    creative,
    type = "ADSET",
    isDraggingCreative,
    hoveringAdSetId,
    className,
}: Props) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({
            id: creative.id,
        });

    const { deleteCreative, setCreativeLabel } = useUploadContext();
    const { adSetGroups, deleteFromGroup } = useUploadedCreativesContext();

    const hoveringAdSet = useMemo(() => {
        if (!isDraggingCreative) return null;
        if (!hoveringAdSetId) return null;

        return adSetGroups.find((group) => group.id === hoveringAdSetId)!;
    }, [isDraggingCreative, hoveringAdSetId, adSetGroups]);

    const [editingLabel, setEditingLabel] = useState(false);
    const [newLabel, setNewLabel] = useState(creative.name);

    const updateLabel = useCallback(() => {
        setEditingLabel(false);

        const trimmedLabel = newLabel.trim();

        if (trimmedLabel.length > 0) {
            setCreativeLabel(creative.id, trimmedLabel);
        } else {
            setNewLabel(creative.label || creative.name);
        }
    }, [creative, newLabel, setCreativeLabel]);

    return (
        <div
            className={cn(
                "rounded-lg",
                isDraggingCreative &&
                    "ring-2 ring-offset-3 ring-blue-100 opacity-90"
            )}
        >
            <div
                ref={setNodeRef}
                style={{
                    transform: transform
                        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
                        : undefined,
                    opacity: isDragging ? 0 : 1,
                    height: HEIGHT,
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
                    <div className="flex items-center mb-1 gap-1.5 truncate">
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
                        <div className="font-semibold flex-1 truncate">
                            {!editingLabel ? (
                                <>
                                    <span
                                        onPointerDown={(e) =>
                                            e.stopPropagation()
                                        }
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingLabel(true);
                                            console.log("yeet");
                                        }}
                                        className="truncate cursor-text peer"
                                    >
                                        {creative.label || creative.name}
                                    </span>
                                    <i className="fa-regular fa-pencil text-[12px] ml-2 text-gray-400 invisible peer-hover:visible" />
                                </>
                            ) : (
                                <div className="p-px">
                                    <input
                                        type="text"
                                        onPointerDown={(e) =>
                                            e.stopPropagation()
                                        }
                                        onClick={(e) => e.stopPropagation()}
                                        className="px-3 py-1.5 w-full bg-white rounded-lg ring-1 ring-gray-200 outline-none text-xs placeholder-gray-400"
                                        value={newLabel}
                                        placeholder={
                                            creative.label || creative.name
                                        }
                                        onChange={(e) =>
                                            setNewLabel(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                            e.stopPropagation();

                                            if (e.key === "Enter") {
                                                updateLabel();
                                                return;
                                            }

                                            if (e.key === "Escape") {
                                                // Cancel edit
                                                setEditingLabel(false);
                                                setNewLabel(
                                                    creative.label ||
                                                        creative.name
                                                );
                                                return;
                                            }
                                        }}
                                        onBlur={() => updateLabel()}
                                        autoFocus
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="text-[12px] font-medium text-gray-500 flex items-center gap-1.5">
                        <div>{creative.size}</div>
                        <div className="text-gray-300">&bull;</div>
                        <div>{creative.extension.toUpperCase()}</div>

                        {hoveringAdSet && (
                            <>
                                <div className="text-gray-300">&bull;</div>
                                <div>{hoveringAdSet.label}</div>
                            </>
                        )}
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
                                deleteFromGroup(creative.id);
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
