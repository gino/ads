import { cn } from "@/lib/cn";
import { useDroppable } from "@dnd-kit/core";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import useMeasure from "react-use-measure";
import { AdCreative, HEIGHT as ADCREATIVE_HEIGHT } from "./ad-creative";
import { useUploadContext } from "./upload-context";
import { useUploadedCreativesContext } from "./uploaded-creatives";

export type FolderType = "ADSET" | "UNGROUPED";

interface Props {
    label: string;
    id: string | "ungrouped";
    type: FolderType;
    creativeIds: string[];
    className?: string;
}

export function AdSetGroup({ id, label, type, creativeIds, className }: Props) {
    const { isOver, setNodeRef, active, over } = useDroppable({
        id,
    });

    const { form } = useUploadContext();
    const { updateGroupLabel } = useUploadedCreativesContext();

    const creatives = useMemo(() => {
        return form.data.creatives.filter((creative) => {
            return creativeIds.includes(creative.id);
        });
    }, [form.data.creatives, creativeIds]);

    const [measureRef, { height }] = useMeasure();
    const [folded, setFolded] = useState(false);

    const [editingLabel, setEditingLabel] = useState(false);
    const [newLabel, setNewLabel] = useState(label);

    const updateLabel = useCallback(() => {
        setEditingLabel(false);

        const trimmedLabel = newLabel.trim();

        if (trimmedLabel.length > 0) {
            updateGroupLabel(id, trimmedLabel);
        } else {
            setNewLabel(label);
        }
    }, [id, label, newLabel, updateGroupLabel]);

    const isOverGroup = useMemo(() => {
        if (!active) return;

        return isOver && !creativeIds.includes(active?.id.toString());
    }, [isOver, creativeIds, active]);

    return (
        <div
            className={cn(
                "rounded-xl",
                isOverGroup && "ring-2 ring-offset-2 ring-blue-100",
                className
            )}
        >
            <div
                ref={setNodeRef}
                className="bg-gray-50 ring-inset ring-1 ring-gray-200/30 rounded-xl select-none"
            >
                <div
                    onClick={() => setFolded((v) => !v)}
                    className="flex px-3 gap-3 items-center h-12 cursor-pointer"
                >
                    <div className="flex items-center flex-1 truncate">
                        <div className="flex items-center justify-center mr-2">
                            <i
                                className={cn(
                                    "fa-regular fa-angle-down text-gray-300 transition-transform duration-200 ease-in-out",
                                    isOverGroup
                                        ? "-rotate-90"
                                        : folded && "-rotate-180"
                                )}
                            />
                        </div>
                        <div className="flex items-center gap-2.5 truncate flex-1">
                            {type === "ADSET" && (
                                <i className="fa-regular text-gray-400 fa-folder shrink-0" />
                            )}
                            <div className="truncate flex-1">
                                <div className="font-semibold truncate">
                                    {!editingLabel ? (
                                        <>
                                            <span
                                                onClick={(e) => {
                                                    if (type === "ADSET") {
                                                        e.stopPropagation();
                                                        setEditingLabel(true);
                                                    }
                                                }}
                                                className={cn(
                                                    "truncate",
                                                    type === "ADSET" &&
                                                        "cursor-text peer"
                                                )}
                                            >
                                                {label}
                                            </span>
                                            {type === "ADSET" && (
                                                <i className="fa-regular fa-pencil text-[12px] ml-2 text-gray-400 invisible peer-hover:visible" />
                                            )}
                                        </>
                                    ) : (
                                        <div className="p-px">
                                            <input
                                                type="text"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                                className="px-3 py-1.5 w-full bg-white rounded-lg ring-1 ring-gray-200 outline-none text-xs placeholder-gray-400"
                                                value={newLabel}
                                                placeholder={label}
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
                                                        setNewLabel(label);
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
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                        className="cursor-pointer active:scale-[0.99] transition-transform duration-100 ease-in-out hover:bg-gray-200/50 text-gray-400 hover:text-black h-6 w-6 text-[12px] flex items-center justify-center rounded-[5px]"
                                    >
                                        <i className="fa-regular fa-cog" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                        className="cursor-pointer active:scale-[0.99] transition-transform duration-100 ease-in-out hover:bg-gray-200/50 text-gray-400 hover:text-black h-6 w-6 text-[12px] flex items-center justify-center rounded-[5px]"
                                    >
                                        <i className="fa-regular fa-clone" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                        className="cursor-pointer active:scale-[0.99] transition-transform duration-100 ease-in-out hover:bg-gray-200/50 text-gray-400 hover:text-red-700 h-6 w-6 text-[12px] flex items-center justify-center rounded-[5px]"
                                    >
                                        <i className="fa-regular fa-trash-can" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div>
                    <AnimatePresence initial={false}>
                        {!folded && (
                            <motion.div
                                className="overflow-hidden will-change-[height,margin-top,opacity,filter]"
                                initial={{
                                    height: 0,
                                    marginTop: 0,
                                    opacity: 0,
                                }}
                                animate={{
                                    height: isOverGroup
                                        ? height + ADCREATIVE_HEIGHT
                                        : creatives.length > 0
                                        ? height
                                        : 0,
                                    marginTop: creatives.length > 0 ? -8 : 0,
                                    // height,
                                    // marginTop: -8,
                                    opacity: 1,
                                    filter: "blur(0px)",
                                }}
                                exit={{
                                    height: 0,
                                    marginTop: 0,
                                    opacity: 0,
                                    filter: "blur(1px)",
                                }}
                                transition={{
                                    duration: 0.25,
                                    ease: "easeOut",
                                }}
                            >
                                <div ref={measureRef} className="relative">
                                    <div className="flex flex-col gap-2 p-2">
                                        {creatives.map((creative) => (
                                            <AdCreative
                                                key={creative.id}
                                                creative={creative}
                                                type={type}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
