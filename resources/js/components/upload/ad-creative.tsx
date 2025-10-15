import { cn } from "@/lib/cn";
import { isInNoDndZone } from "@/lib/dnd-sensors";
import { UploadedCreative } from "@/pages/upload";
import * as Ariakit from "@ariakit/react";
import { useDraggable } from "@dnd-kit/core";
import { useCallback, useMemo, useState } from "react";
import { toast } from "../ui/toast";
import { AdCreativePreview } from "./ad-creative-preview";
import { FolderType } from "./adset-group";
import { useUploadContext } from "./upload-context";
import { useUploadedCreativesContext } from "./uploaded-creatives";

export const HEIGHT = 72;

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

    const {
        deleteCreative,
        setCreativeLabel,
        setPopupCreativeId,
        getCreativeSettings,
    } = useUploadContext();
    const { deleteFromGroup, toggleSelection, selectedIds, activeId } =
        useUploadedCreativesContext();

    const isSelected = selectedIds.includes(creative.id);
    const isActive = activeId === creative.id;

    const shouldHide =
        !isDraggingCreative &&
        (isActive || (activeId && isSelected && selectedIds.length > 1));

    const [editingLabel, setEditingLabel] = useState(false);
    const [newLabel, setNewLabel] = useState(creative.name);

    const updateLabel = useCallback(() => {
        setEditingLabel(false);

        const trimmedLabel = newLabel.trim();

        if (trimmedLabel.length > 0) {
            setCreativeLabel(creative.id, trimmedLabel);
            toast({
                contents: `Ad creative renamed to "${trimmedLabel}"`,
            });
        } else {
            setNewLabel(creative.label || creative.name);
        }
    }, [creative, newLabel, setCreativeLabel]);

    const { primaryTexts, headlines, descriptions } = getCreativeSettings(
        creative.id
    );

    const showTextIndicators = useMemo(() => {
        return true;
    }, [primaryTexts, headlines, descriptions]);

    return (
        <Ariakit.HovercardProvider>
            <div
                className={cn(
                    "rounded-lg relative",
                    isDraggingCreative
                        ? "ring-3 ring-offset-0 ring-blue-100"
                        : isSelected &&
                              !isDraggingCreative &&
                              "ring-3 ring-offset-0 ring-blue-100"
                )}
                style={{ opacity: isDragging ? 0 : shouldHide ? 0 : 1 }}
            >
                <div
                    ref={setNodeRef}
                    onClick={(e) => {
                        if (isInNoDndZone(e)) return;

                        toggleSelection(creative.id, e);
                    }}
                    style={{
                        transform: transform
                            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
                            : undefined,
                        height: HEIGHT,
                    }}
                    className={cn(
                        "rounded-lg px-3 py-3 gap-3 flex items-center cursor-grab shrink-0 focus-visible:outline outline-none bg-white",

                        isSelected && !isDraggingCreative
                            ? "shadow-base"
                            : isDraggingCreative
                            ? "shadow-base-popup"
                            : "shadow-base",
                        className
                    )}
                    {...listeners}
                    {...attributes}
                >
                    <i className="fa-solid fa-grip-dots-vertical text-[10px] text-gray-300" />

                    <Ariakit.HovercardAnchor>
                        <div className="h-12 w-12 bg-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                            {creative.thumbnail !== null ? (
                                <div className="cursor-pointer relative after:absolute after:inset-0 after:ring-1 after:ring-inset after:rounded-lg after:ring-black/5 h-full w-full">
                                    <img
                                        src={creative.thumbnail}
                                        className="h-full w-full object-center object-cover"
                                    />
                                </div>
                            ) : (
                                <i className="fa-regular fa-file" />
                            )}
                        </div>
                    </Ariakit.HovercardAnchor>

                    {creative.thumbnail !== null && (
                        <Ariakit.Hovercard
                            portal
                            gutter={4}
                            unmountOnHide
                            className="bg-white p-0.5 shadow-base-popup rounded-lg w-48"
                        >
                            <AdCreativePreview creative={creative} />
                        </Ariakit.Hovercard>
                    )}

                    <div className="flex-1 truncate">
                        <div className="flex items-center mb-1 gap-1.5 truncate">
                            {!editingLabel && (
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
                            )}
                            <div className="font-semibold flex-1 min-w-0 flex items-center">
                                {!editingLabel ? (
                                    <>
                                        <span
                                            data-no-dnd
                                            onDoubleClick={() => {
                                                setEditingLabel(true);
                                            }}
                                            className="truncate cursor-text peer"
                                        >
                                            {creative.label || creative.name}
                                        </span>
                                        <i className="fa-regular fa-pencil text-[12px] ml-2 text-gray-400 invisible peer-hover:visible" />
                                    </>
                                ) : (
                                    <div className="p-px flex-1">
                                        <input
                                            type="text"
                                            data-no-dnd
                                            className="px-3 py-1.5 w-full bg-white rounded-lg ring-1 ring-gray-200 outline-none text-xs placeholder-gray-400"
                                            value={newLabel}
                                            placeholder={
                                                creative.label || creative.name
                                            }
                                            onChange={(e) =>
                                                setNewLabel(e.target.value)
                                            }
                                            onKeyDown={(e) => {
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
                        </div>
                    </div>

                    <div className="flex items-center">
                        {showTextIndicators && !editingLabel && (
                            <div className="flex items-center gap-[3px] mr-3">
                                <div
                                    className={cn(
                                        "font-semibold ring-1 ring-inset ring-black/5 bg-gray-50 text-[10px] px-2 inline-block rounded-full leading-4",
                                        !primaryTexts?.[0]?.trim() &&
                                            "opacity-30"
                                    )}
                                >
                                    P
                                </div>

                                <div
                                    className={cn(
                                        "font-semibold ring-1 ring-inset ring-black/5 bg-gray-50 text-[10px] px-2 inline-block rounded-full leading-4",
                                        !headlines?.[0]?.trim() && "opacity-30"
                                    )}
                                >
                                    H
                                </div>

                                <div
                                    className={cn(
                                        "font-semibold ring-1 ring-inset ring-black/5 bg-gray-50 text-[10px] px-2 inline-block rounded-full leading-4",
                                        !descriptions?.[0]?.trim() &&
                                            "opacity-30"
                                    )}
                                >
                                    D
                                </div>
                            </div>
                        )}

                        <div className="w-px h-4 bg-gray-100 mr-3" />
                        <div
                            data-no-dnd
                            className="flex items-center gap-1 pointer-events-auto"
                        >
                            <button
                                onClick={() => {
                                    setPopupCreativeId(creative.id);
                                }}
                                className="h-8 w-8 flex items-center justify-center cursor-pointer hover:shadow-base rounded-lg active:scale-[0.99] transition-[transform,color] duration-100 ease-in-out text-gray-400 hover:text-black hover:bg-white"
                            >
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
                                    // if (
                                    //     confirm(
                                    //         "Are you sure you want to delete this creative? Any unsaved changes will be lost."
                                    //     )
                                    // ) {
                                    deleteFromGroup(creative.id);
                                    deleteCreative(creative.id);
                                    // }
                                }}
                                className="h-8 w-8 flex items-center justify-center cursor-pointer hover:shadow-base rounded-lg active:scale-[0.99] transition-[transform,color] duration-100 ease-in-out text-gray-400 hover:text-red-700 hover:bg-white"
                            >
                                <i className="fa-regular fa-trash-can" />
                            </button>
                        </div>
                    </div>

                    {isDraggingCreative && selectedIds.length > 1 && (
                        <div className="absolute -top-2.5 -left-2.5">
                            <div className="bg-white shadow-base flex items-center justify-center rounded-full text-[12px] h-6 w-6 text-whitde dring-2 ring-white font-semibold">
                                {selectedIds.length}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Ariakit.HovercardProvider>
    );
}
