import { AdSetGroup as AdSetGroupType } from "@/pages/upload";
import { Portal } from "@ariakit/react";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
} from "@dnd-kit/core";
import { motion } from "motion/react";
import {
    createContext,
    MouseEvent,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { toast } from "../ui/toast";
import { AdCreative } from "./ad-creative";
import { AdSetGroup } from "./adset-group";
import { useUploadContext } from "./upload-context";

// Multi select
// https://github.com/clauderic/dnd-kit/pull/588/files
// https://5fc05e08a4a65d0021ae0bf2-yivpqsvbcy.chromatic.com/?path=/docs/presets-sortable-multiple-containers--multi-select

interface UploadedCreativesContextType {
    adSetGroups: AdSetGroupType[];
    createGroup: (label: string) => void;
    cloneGroup: (groupId: string) => void;
    deleteGroup: (groupId: string) => void;
    deleteFromGroup: (creativeId: string) => void;
    addToGroup: (creativeId: string, groupId: string) => void;
    updateGroupLabel: (groupId: string, label: string) => void;
    //
    selectedIds: string[];
    toggleSelection: (id: string, e: MouseEvent) => void;
}

const UploadedCreativesContext = createContext<UploadedCreativesContextType>(
    null!
);

interface Props {
    adSets: App.Data.AdSetData[];
}

export function UploadedCreatives({ adSets }: Props) {
    const { form } = useUploadContext();

    const [adSetGroups, setAdSetGroups] = useState<AdSetGroupType[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const toggleSelection = useCallback((id: string, e: MouseEvent) => {
        if (e.shiftKey) {
            setSelectedIds((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
            );
        } else {
            setSelectedIds([id]);
        }
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedIds([]);
    }, []);

    const hasSelectedAdSet = useMemo(() => {
        return !!form.data.adSetId;
    }, [form.data.adSetId]);

    const selectedAdSet = useMemo(() => {
        if (!hasSelectedAdSet) return null;

        return adSets.find((adSet) => adSet.id === form.data.adSetId);
    }, [hasSelectedAdSet, form.data.adSetId, adSets]);
    const [selectedAdSetCreatives, setSelectedAdSetCreatives] = useState<
        string[]
    >([]);

    useEffect(() => {
        if (!form.data.adSetId) return;

        // Reset adSetGroups if user selects an existing adset
        setAdSetGroups([]);

        // It might be nice/convenient to not reset this
        setSelectedAdSetCreatives([]);
    }, [form.data.adSetId]);

    const ungroupedCreatives = useMemo(() => {
        if (hasSelectedAdSet) {
            return form.data.creatives
                .map((creative) => creative.id)
                .filter((id) => {
                    return !selectedAdSetCreatives.includes(id);
                });
        }

        return form.data.creatives
            .map((creative) => creative.id)
            .filter((id) => {
                return !adSetGroups.some((adSetGroup) => {
                    return adSetGroup.creatives.includes(id);
                });
            });
    }, [
        form.data.creatives,
        adSetGroups,
        hasSelectedAdSet,
        selectedAdSetCreatives,
    ]);

    const [activeId, setActiveId] = useState<string | null>(null);

    // const draggingCreative = useMemo(() => {
    //     return form.data.creatives.find(
    //         (creative) => creative.id === activeId
    //     )!;
    // }, [form.data.creatives, activeId]);

    const draggingCreatives = useMemo(() => {
        if (!activeId) return [];
        if (selectedIds.includes(activeId)) {
            return form.data.creatives.filter((c) =>
                selectedIds.includes(c.id)
            );
        }
        return [form.data.creatives.find((c) => c.id === activeId)!];
    }, [activeId, selectedIds, form.data.creatives]);

    const createGroup = useCallback(
        (label: string) => {
            setAdSetGroups((adSetGroups) => [
                ...adSetGroups,
                {
                    id: crypto.randomUUID(),
                    label,
                    creatives: [],
                },
            ]);
        },
        [setAdSetGroups, adSetGroups]
    );

    const cloneGroup = useCallback(
        (groupId: string) => {
            const group = adSetGroups.find((group) => group.id === groupId)!;

            createGroup(`${group.label} - Copy`);
        },
        [createGroup, adSetGroups]
    );

    const deleteGroup = useCallback(
        (groupId: string) => {
            setAdSetGroups((groups) =>
                groups.filter((group) => group.id !== groupId)
            );
        },
        [setAdSetGroups]
    );

    const deleteFromGroup = useCallback(
        (creativeId: string) => {
            if (hasSelectedAdSet) {
                setSelectedAdSetCreatives((creatives) => {
                    // ✅ Only update if the ID actually exists
                    if (!creatives.includes(creativeId)) return creatives;
                    return creatives.filter((id) => id !== creativeId);
                });
                return;
            }

            setAdSetGroups((prev) =>
                prev.map((group) => {
                    if (!group.creatives.includes(creativeId)) return group; // ✅ skip if not found
                    return {
                        ...group,
                        creatives: group.creatives.filter(
                            (id) => id !== creativeId
                        ),
                    };
                })
            );
        },
        [setAdSetGroups, setSelectedAdSetCreatives, hasSelectedAdSet]
    );

    const addToGroup = useCallback(
        (creativeId: string, groupId: string) => {
            if (groupId === "ungrouped") return;

            if (hasSelectedAdSet) {
                setSelectedAdSetCreatives((creatives) => {
                    // ✅ Only update if not already in list
                    if (creatives.includes(creativeId)) return creatives;
                    return [...creatives, creativeId];
                });
                return;
            }

            setAdSetGroups((prev) =>
                prev.map((group) => {
                    if (group.id !== groupId) return group;
                    if (group.creatives.includes(creativeId)) return group; // ✅ skip if already in group
                    return {
                        ...group,
                        creatives: [...group.creatives, creativeId],
                    };
                })
            );
        },
        [setAdSetGroups, setSelectedAdSetCreatives, hasSelectedAdSet]
    );

    const updateGroupLabel = useCallback(
        (groupId: string, label: string) => {
            setAdSetGroups((prev) =>
                prev.map((group) =>
                    group.id === groupId ? { ...group, label } : group
                )
            );
        },
        [setAdSetGroups]
    );

    const memoizedValue = useMemo<UploadedCreativesContextType>(
        () => ({
            adSetGroups,
            createGroup,
            cloneGroup,
            deleteGroup,
            deleteFromGroup,
            addToGroup,
            updateGroupLabel,
            selectedIds,
            toggleSelection,
        }),
        [
            adSetGroups,
            createGroup,
            cloneGroup,
            deleteGroup,
            deleteFromGroup,
            addToGroup,
            updateGroupLabel,
            selectedIds,
            toggleSelection,
        ]
    );

    return (
        <div className="min-w-0 p-1 bg-gray-100 rounded-2xl shrink-0 ring-inset ring-1 ring-gray-200/30 h-full min-h-0">
            <div className="bg-white shadow-base rounded-xl overflow-hidden h-full flex flex-col min-h-0">
                <div className="flex-1 min-h-0 overflow-y-auto">
                    {!hasSelectedAdSet && (
                        <div className="p-5 border-b border-gray-100">
                            <div className="flex justify-end items-center gap-2">
                                <button
                                    onClick={() => {
                                        createGroup(
                                            `Ad set ${adSetGroups.length + 1}`
                                        );
                                    }}
                                    className="bg-white font-semibold shadow-base px-3.5 py-2 rounded-md cursor-pointer active:scale-[0.99] transition-transform duration-100 ease-in-out"
                                >
                                    Create ad set
                                </button>

                                <button
                                    disabled
                                    className="font-semibold cursor-pointer active:scale-[0.99] transition-transform duration-100 ease-in-out text-white ring-1 disabled:cursor-not-allowed bg-brand ring-brand px-3.5 py-2 rounded-md disabled:opacity-50"
                                >
                                    Launch {form.data.creatives.length} ads
                                </button>
                            </div>
                        </div>
                    )}
                    <DndContext
                        sensors={[
                            useSensor(PointerSensor, {
                                activationConstraint: {
                                    distance: 5, // must move 5px before drag starts
                                },
                            }),
                        ]}
                        onDragStart={({ active }) => {
                            if (!selectedIds.includes(active.id as string)) {
                                setSelectedIds([active.id as string]);
                            }
                            setActiveId(active.id as string);
                        }}
                        onDragCancel={() => setActiveId(null)}
                        onDragEnd={({ over }) => {
                            setActiveId(null);
                            if (!over) return;

                            const targetGroupId = over.id as string;
                            if (!targetGroupId) return;

                            draggingCreatives.forEach((creative) => {
                                const creativeId = creative.id;
                                const currentGroupId = hasSelectedAdSet
                                    ? selectedAdSetCreatives.includes(
                                          creativeId
                                      )
                                        ? selectedAdSet!.id
                                        : "ungrouped"
                                    : adSetGroups.find((g) =>
                                          g.creatives.includes(creativeId)
                                      )?.id ?? "ungrouped";

                                if (currentGroupId === targetGroupId) return;

                                deleteFromGroup(creativeId);
                                addToGroup(creativeId, targetGroupId);
                            });

                            clearSelection();

                            if (targetGroupId !== "ungrouped") {
                                toast({
                                    contents: `${draggingCreatives.length} ${
                                        draggingCreatives.length > 1
                                            ? `creatives`
                                            : `creative`
                                    } added to ad set`,
                                });
                            }
                        }}
                    >
                        <UploadedCreativesContext.Provider
                            value={memoizedValue}
                        >
                            {/* <div>{JSON.stringify(selectedIds)}</div> */}
                            <div className="flex flex-col">
                                {(hasSelectedAdSet
                                    ? true
                                    : adSetGroups.length > 0) && (
                                    <div className="p-5 flex flex-col border-b border-gray-100">
                                        {hasSelectedAdSet ? (
                                            <AdSetGroup
                                                id={selectedAdSet!.id}
                                                label={selectedAdSet!.name}
                                                type="ADSET"
                                                creativeIds={
                                                    selectedAdSetCreatives
                                                }
                                                isExistingAdSet
                                            />
                                        ) : (
                                            adSetGroups.map((adSetGroup) => (
                                                <AdSetGroup
                                                    key={adSetGroup.id}
                                                    id={adSetGroup.id}
                                                    label={adSetGroup.label}
                                                    type="ADSET"
                                                    creativeIds={
                                                        adSetGroup.creatives
                                                    }
                                                />
                                            ))
                                        )}
                                    </div>
                                )}

                                <div className="p-5">
                                    <AdSetGroup
                                        id="ungrouped"
                                        label="Ungrouped creatives"
                                        type="UNGROUPED"
                                        creativeIds={ungroupedCreatives}
                                    />
                                </div>
                            </div>
                            <Portal>
                                <DragOverlay dropAnimation={null}>
                                    {activeId &&
                                        draggingCreatives.length > 0 && (
                                            <motion.div
                                                initial={{ scale: 1 }}
                                                animate={{ scale: 1.02 }}
                                                transition={{
                                                    duration: 0.15,
                                                    ease: "easeInOut",
                                                }}
                                            >
                                                {draggingCreatives.length >
                                                1 ? (
                                                    <AdCreative
                                                        creative={
                                                            draggingCreatives[0]
                                                        }
                                                        draggingCreatives={
                                                            draggingCreatives.length
                                                        }
                                                        isDraggingCreative
                                                    />
                                                ) : (
                                                    <AdCreative
                                                        creative={
                                                            draggingCreatives[0]
                                                        }
                                                        isDraggingCreative
                                                    />
                                                )}
                                            </motion.div>
                                        )}
                                </DragOverlay>
                            </Portal>
                        </UploadedCreativesContext.Provider>
                    </DndContext>
                </div>
            </div>
        </div>
    );
}

export function useUploadedCreativesContext() {
    return useContext(UploadedCreativesContext);
}
