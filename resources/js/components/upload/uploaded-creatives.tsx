import { cn } from "@/lib/cn";
import { Portal } from "@ariakit/react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { motion } from "motion/react";
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";
import { AdCreative } from "./ad-creative";
import { AdSetGroup } from "./adset-group";
import { useUploadContext } from "./upload-context";

interface AdSetGroup {
    id: string;
    label: string;
    creatives: string[];
}

interface UploadedCreativesContextType {
    adSetGroups: AdSetGroup[];
    deleteFromGroup: (creativeId: string) => void;
    addToGroup: (creativeId: string, groupId: string) => void;
    updateGroupLabel: (groupId: string, label: string) => void;
}

const UploadedCreativesContext = createContext<UploadedCreativesContextType>(
    null!
);

export function UploadedCreatives() {
    const { form } = useUploadContext();

    const [adSetGroups, setAdSetGroups] = useState([
        {
            id: "adset-1",
            label: "Ad set 1",
            creatives: [] as string[],
        },
    ]);

    const ungroupedCreatives = useMemo(() => {
        return form.data.creatives
            .map((creative) => creative.id)
            .filter((id) => {
                return !adSetGroups.some((adSetGroup) => {
                    return adSetGroup.creatives.includes(id);
                });
            });
    }, [form.data.creatives, adSetGroups]);

    const [activeId, setActiveId] = useState<string | null>(null);
    const [hoveringAdSetId, setHoveringAdSetId] = useState<string | null>(null);

    const draggingCreative = useMemo(() => {
        return form.data.creatives.find(
            (creative) => creative.id === activeId
        )!;
    }, [form.data.creatives, activeId]);

    const deleteFromGroup = useCallback(
        (creativeId: string) => {
            setAdSetGroups((prev) =>
                prev.map((group) => ({
                    ...group,
                    creatives: group.creatives.filter(
                        (id) => id !== creativeId
                    ),
                }))
            );
        },
        [setAdSetGroups]
    );

    const addToGroup = useCallback(
        (creativeId: string, groupId: string) => {
            if (groupId === "ungrouped") return;
            setAdSetGroups((prev) =>
                prev.map((group) =>
                    group.id === groupId
                        ? {
                              ...group,
                              creatives: [...group.creatives, creativeId],
                          }
                        : group
                )
            );
        },
        [setAdSetGroups]
    );

    const updateGroupLabel = useCallback((groupId: string, label: string) => {
        setAdSetGroups((prev) =>
            prev.map((group) =>
                group.id === groupId ? { ...group, label } : group
            )
        );
    }, []);

    const memoizedValue = useMemo<UploadedCreativesContextType>(
        () => ({
            adSetGroups,
            deleteFromGroup,
            addToGroup,
            updateGroupLabel,
        }),
        [adSetGroups, deleteFromGroup, addToGroup, updateGroupLabel]
    );

    return (
        <div className="min-w-0 p-1 bg-gray-100 rounded-2xl shrink-0 ring-inset ring-1 ring-gray-200/30 h-full min-h-0">
            <div className="bg-white shadow-base rounded-xl overflow-hidden h-full flex flex-col min-h-0">
                <div className="flex-1 min-h-0 overflow-y-auto">
                    <div className="p-5 border-b border-gray-100">
                        <div className="flex justify-end">
                            <button
                                onClick={() => {
                                    setAdSetGroups((adSetGroups) => [
                                        ...adSetGroups,
                                        {
                                            id: crypto.randomUUID(),
                                            label: `Ad set ${
                                                adSetGroups.length + 1
                                            }`,
                                            creatives: [],
                                        },
                                    ]);
                                }}
                                className="bg-white font-semibold shadow-base px-3.5 py-2 rounded-md cursor-pointer active:scale-[0.99] transition-transform duration-100 ease-in-out"
                            >
                                Create ad set
                            </button>
                        </div>
                    </div>
                    <UploadedCreativesContext.Provider value={memoizedValue}>
                        <DndContext
                            onDragStart={(event) =>
                                setActiveId(event.active.id as string)
                            }
                            onDragCancel={() => setActiveId(null)}
                            onDragOver={(event) => {
                                if (!event.active || !event.over) return;

                                if (event.over.id === "ungrouped") {
                                    setHoveringAdSetId(null);
                                } else {
                                    setHoveringAdSetId(
                                        event.over.id.toString()
                                    );
                                }
                            }}
                            onDragEnd={(event) => {
                                setActiveId(null);

                                const { over, active } = event;
                                if (!over) return;

                                const creativeId = active.id as string;
                                const targetGroupId = over.id as string;

                                if (!creativeId || !targetGroupId) return;

                                // ✅ remove from all groups first
                                deleteFromGroup(creativeId);

                                // ✅ add to target if not ungrouped
                                addToGroup(creativeId, targetGroupId);
                            }}
                        >
                            <div className="p-5 flex flex-col">
                                <div className="flex flex-col">
                                    {adSetGroups.map((adSetGroup) => (
                                        <AdSetGroup
                                            key={adSetGroup.id}
                                            id={adSetGroup.id}
                                            label={adSetGroup.label}
                                            type="ADSET"
                                            creativeIds={adSetGroup.creatives}
                                            className={cn(
                                                adSetGroup.creatives.length ===
                                                    0
                                                    ? "mb-2.5"
                                                    : "mb-5",
                                                "last:mb-0"
                                            )}
                                        />
                                    ))}
                                </div>

                                <div className="border-t border-gray-100 pt-5 mt-5 -mx-5 px-5">
                                    <AdSetGroup
                                        id="ungrouped"
                                        label="Ungrouped creatives"
                                        type="UNGROUPED"
                                        creativeIds={ungroupedCreatives}
                                    />
                                </div>
                            </div>
                            <Portal>
                                <DragOverlay
                                    dropAnimation={null}
                                    // dropAnimation={{
                                    //     duration: 300,
                                    //     easing: "ease-in-out",
                                    // }}
                                >
                                    {activeId && (
                                        <motion.div
                                            initial={{ scale: 1 }}
                                            animate={{
                                                scale: 1.02,
                                            }}
                                            transition={{
                                                duration: 0.15,
                                                ease: "easeInOut",
                                            }}
                                        >
                                            <AdCreative
                                                creative={draggingCreative}
                                                hoveringAdSetId={
                                                    hoveringAdSetId
                                                }
                                                isDraggingCreative
                                            />
                                        </motion.div>
                                    )}
                                </DragOverlay>
                            </Portal>
                        </DndContext>
                    </UploadedCreativesContext.Provider>
                </div>
            </div>
        </div>
    );
}

export function useUploadedCreativesContext() {
    return useContext(UploadedCreativesContext);
}
