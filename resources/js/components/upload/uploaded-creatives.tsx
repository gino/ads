import {
    AdSetGroupSettings,
    AdSetGroup as AdSetGroupType,
} from "@/pages/upload";
import { Portal } from "@ariakit/react";
import {
    DndContext,
    DragOverlay,
    MouseSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
} from "@dnd-kit/core";
import axios from "axios";
import { motion } from "motion/react";
import {
    createContext,
    Dispatch,
    MouseEvent,
    SetStateAction,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Button } from "../ui/button";
import { toast } from "../ui/toast";
import { AdCreative } from "./ad-creative";
import { AdSetGroup } from "./adset-group";
import { AdSetGroupSettingsPopup } from "./popups/adset-group-settings";
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
    activeId: string | null;
    selectedIds: string[];
    toggleSelection: (id: string, e: MouseEvent) => void;
    //
    popupAdSetId: string | null;
    setPopupAdSetId: Dispatch<SetStateAction<string | null>>;
    //
    updateSetting: <T extends keyof AdSetGroupSettings>(
        id: string,
        key: T,
        value: AdSetGroupSettings[T]
    ) => void;
    getSettings: (id: string) => AdSetGroupSettings;
}

const UploadedCreativesContext = createContext<UploadedCreativesContextType>(
    null!
);
UploadedCreativesContext.displayName = "UploadedCreativesContext";

export const defaultAdSetSettings: AdSetGroupSettings = { locations: ["US"] };

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
            setSelectedIds((prev) =>
                prev.length === 1 && prev[0] === id ? [] : [id]
            );
        }
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedIds([]);
    }, [setSelectedIds]);

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

    const getCreativesInCurrentGroup = useCallback(() => {
        if (selectedIds.length === 0) return [];

        const referenceId = selectedIds[0];

        // Check selected ad set first
        if (hasSelectedAdSet) {
            if (selectedAdSetCreatives.includes(referenceId))
                return selectedAdSetCreatives;
            return form.data.creatives
                .map((c) => c.id)
                .filter((id) => !selectedAdSetCreatives.includes(id)); // ungrouped
        }

        // Otherwise, check adSetGroups
        for (const group of adSetGroups) {
            if (group.creatives.includes(referenceId)) return group.creatives;
        }

        // Ungrouped
        return form.data.creatives
            .map((c) => c.id)
            .filter((id) => !adSetGroups.some((g) => g.creatives.includes(id)));
    }, [
        selectedIds,
        adSetGroups,
        selectedAdSetCreatives,
        hasSelectedAdSet,
        form.data.creatives,
    ]);

    const extendSelection = useCallback(
        (direction: "up" | "down") => {
            const currentGroup = getCreativesInCurrentGroup();
            if (currentGroup.length === 0) return;

            const lastSelectedId = selectedIds[selectedIds.length - 1];
            const currentIndex = currentGroup.findIndex(
                (id) => id === lastSelectedId
            );

            let nextIndex =
                direction === "up" ? currentIndex - 1 : currentIndex + 1;
            nextIndex = Math.max(
                0,
                Math.min(nextIndex, currentGroup.length - 1)
            );

            const nextId = currentGroup[nextIndex];
            setSelectedIds((prev) =>
                prev.includes(nextId) ? prev : [...prev, nextId]
            );
        },
        [selectedIds, getCreativesInCurrentGroup]
    );

    useEffect(() => {
        if (!form.data.adSetId) return;

        // Reset adSetGroups if user selects an existing adset
        setAdSetGroups([]);

        // It might be nice/convenient to not reset this
        setSelectedAdSetCreatives([]);

        // Clear selection
        clearSelection();
    }, [form.data.adSetId, selectedAdSet, clearSelection]);

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
                    settings: defaultAdSetSettings,
                },
            ]);
            // clearSelection();
        },
        [setAdSetGroups, clearSelection]
    );

    const cloneGroup = useCallback(
        (groupId: string) => {
            setAdSetGroups((groups) => {
                const index = groups.findIndex((g) => g.id === groupId);
                if (index === -1) return groups;

                const group = groups[index];
                const newGroup = {
                    id: crypto.randomUUID(),
                    label: `${group.label} - Copy`,
                    // creatives: [...group.creatives], // copy creatives too?
                    creatives: [],
                    settings: group.settings,
                };

                const newGroups = [...groups];
                newGroups.splice(index + 1, 0, newGroup); // insert right after
                return newGroups;
            });
        },
        [setAdSetGroups]
    );

    const deleteGroup = useCallback(
        (groupId: string) => {
            setAdSetGroups((groups) =>
                groups.filter((group) => group.id !== groupId)
            );
            clearSelection();
        },
        [setAdSetGroups, clearSelection]
    );

    const deleteFromGroup = useCallback(
        (creativeId: string) => {
            if (hasSelectedAdSet) {
                setSelectedAdSetCreatives((creatives) => {
                    // ✅ Only update if the ID actually exists
                    if (!creatives.includes(creativeId)) return creatives;
                    return creatives.filter((id) => id !== creativeId);
                });
                clearSelection();
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
            clearSelection();
        },
        [
            setAdSetGroups,
            setSelectedAdSetCreatives,
            hasSelectedAdSet,
            clearSelection,
        ]
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
                clearSelection();
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
            clearSelection();
        },
        [
            setAdSetGroups,
            setSelectedAdSetCreatives,
            hasSelectedAdSet,
            clearSelection,
        ]
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

    const [popupAdSetId, setPopupAdSetId] = useState<string | null>(null);

    const updateSetting = useCallback(
        <T extends keyof AdSetGroupSettings>(
            id: string,
            key: T,
            value: AdSetGroupSettings[T]
        ) => {
            setAdSetGroups((prev) =>
                prev.map((group) =>
                    group.id === id
                        ? {
                              ...group,
                              settings: {
                                  ...(group.settings as AdSetGroupSettings),
                                  [key]: value,
                              },
                          }
                        : group
                )
            );
        },
        [hasSelectedAdSet, setAdSetGroups]
    );

    const getSettings = useCallback(
        (id: string): AdSetGroupSettings => {
            const group = adSetGroups.find((g) => g.id === id);
            return group ? group.settings : defaultAdSetSettings;
        },
        [hasSelectedAdSet, selectedAdSet, adSetGroups]
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
            activeId,
            selectedIds,
            toggleSelection,
            popupAdSetId,
            setPopupAdSetId,
            updateSetting,
            getSettings,
        }),
        [
            adSetGroups,
            createGroup,
            cloneGroup,
            deleteGroup,
            deleteFromGroup,
            addToGroup,
            updateGroupLabel,
            activeId,
            selectedIds,
            toggleSelection,
            popupAdSetId,
            setPopupAdSetId,
            updateSetting,
            getSettings,
        ]
    );

    // const activationConstraint = { delay: 100, tolerance: 5 };
    const activationConstraint = { distance: 0.5 };

    const sensors = [
        useSensor(PointerSensor, {
            activationConstraint,
        }),
        useSensor(MouseSensor, {
            activationConstraint,
        }),
        useSensor(TouchSensor, {
            activationConstraint,
        }),
    ];

    // Hot keys
    useHotkeys(
        ["esc"],
        (e) => {
            e.preventDefault();
            clearSelection();
        },
        { enabled: popupAdSetId === null }
    );
    useHotkeys(
        ["meta+a", "ctrl+a"],
        (e) => {
            e.preventDefault();

            const allIds = form.data.creatives.map((c) => c.id);

            // If all are already selected, clear; otherwise, select all
            if (selectedIds.length === allIds.length) {
                setSelectedIds([]);
            } else {
                setSelectedIds(allIds);
            }
        },
        { enabled: popupAdSetId === null },
        [form.data.creatives, selectedIds]
    );
    useHotkeys(
        "shift+arrowup",
        (e) => {
            e.preventDefault();
            extendSelection("up");
        },
        { enabled: popupAdSetId === null },
        [extendSelection]
    );
    useHotkeys(
        "shift+arrowdown",
        (e) => {
            e.preventDefault();
            extendSelection("down");
        },
        { enabled: popupAdSetId === null },
        [extendSelection]
    );

    const isDisabled = useMemo(() => {
        if (!form.data.campaignId) return true;
        if (!form.data.pixelId) return true;
        if (!form.data.facebookPageId) return true;

        // Disable if no creatives at all
        if (form.data.creatives.length === 0) return true;

        // Disable if any creatives are ungrouped
        if (ungroupedCreatives.length > 0) return true;

        // Disable if any ad set group is empty
        const hasEmptyGroup = adSetGroups.some(
            (group) => group.creatives.length === 0
        );
        if (hasEmptyGroup) return true;

        return false; // All checks passed
    }, [
        form.data.campaignId,
        form.data.pixelId,
        form.data.facebookPageId,
        form.data.creatives,
        ungroupedCreatives,
        adSetGroups,
    ]);

    const [loadingState, setLoadingState] = useState<
        "CREATING_ADSETS" | "UPLOADING_CREATIVES" | null
    >(null);

    const loadingText = useMemo(() => {
        const adsLabel = `${form.data.creatives.length} ad${
            form.data.creatives.length === 1 ? "" : "s"
        }`;

        const adSetsLabel = `${adSetGroups.length} ad set${
            adSetGroups.length === 1 ? "" : "s"
        }`;

        if (!loadingState) {
            return null;
        }

        switch (loadingState) {
            case "CREATING_ADSETS": {
                return `Creating ${adSetsLabel}...`;
            }

            case "UPLOADING_CREATIVES": {
                return `Launching ${adsLabel}...`;
            }
        }
    }, [loadingState, form.data.creatives.length, adSetGroups.length]);

    const submit = useCallback(async () => {
        const adSetMap = new Map<string, string>();

        // Create adsets
        try {
            setLoadingState("CREATING_ADSETS");
            const response = await axios.post<string[]>(
                route("dashboard.upload.create-adsets"),
                {
                    adSets: adSetGroups.map((adSet) => ({
                        id: adSet.id,
                        label: adSet.label,
                        settings: adSet.settings,
                    })),
                    campaignId: form.data.campaignId,
                    pixelId: form.data.pixelId,
                    settings: {
                        pausedByDefault: form.data.settings.paused_by_default,
                        disableEnhancements:
                            form.data.settings.disable_enhancements,
                        disablePromoCodes:
                            form.data.settings.disable_promo_codes,
                    },
                }
            );

            const createdAdSetIds = response.data;

            // This works but I'm not sure how consistent this is. Since this heavily depends on the order we get the IDs returned from Meta API - is this order always the same?
            // > The ordering of responses correspond with the ordering of operations in the request. You should process responses accordingly to determine which operations were successful and which should be retried in a subsequent operation.
            // TLDR: We can most likely do it this way (based on indexes)
            // https://developers.facebook.com/docs/graph-api/batch-requests/#complex-batch-requests
            for (const [index, createdAdSetId] of createdAdSetIds.entries()) {
                const adSetGroup = adSetGroups[index]!;
                adSetMap.set(adSetGroup.id, createdAdSetId);
                console.log({
                    a: createdAdSetId,
                    b: adSetGroup,
                });
            }
        } catch (err) {
            setLoadingState(null);
        }

        // Create creatives
        try {
            setLoadingState("UPLOADING_CREATIVES");
            for (const creative of form.data.creatives) {
                const adSetGroup = adSetGroups.find((group) => {
                    return group.creatives.includes(creative.id);
                })!;
                const adSetId = adSetMap.get(adSetGroup.id)!;
                const formData = new FormData();

                formData.append("id", creative.id);
                formData.append("name", creative.label || creative.name);
                formData.append("file", creative.file);
                formData.append("adSetId", adSetId);
                formData.append("facebookPageId", form.data.facebookPageId);
                formData.append("instagramPageId", form.data.instagramPageId);

                Object.entries(creative.settings).forEach(([key, value]) => {
                    formData.append(`settings[${key}]`, value);
                });

                const response = await axios.post(
                    route("dashboard.upload.creative"),
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                console.log(response.data);
            }
        } catch (err) {
            //
        } finally {
            setLoadingState(null);
        }
    }, [
        adSetGroups,
        form.data.campaignId,
        form.data.pixelId,
        form.data.creatives,
        form.data.facebookPageId,
        form.data.instagramPageId,
        form.data.settings.paused_by_default,
        form.data.settings.disable_enhancements,
        form.data.settings.disable_promo_codes,
        setLoadingState,
    ]);

    return (
        <div className="p-1 min-w-0 h-full min-h-0 bg-gray-100 rounded-2xl ring-1 ring-inset shrink-0 ring-gray-200/30">
            <div className="flex overflow-hidden flex-col h-full min-h-0 bg-white rounded-xl shadow-base">
                <div className="overflow-y-auto flex-1 min-h-0">
                    <div className="p-5 border-b border-gray-100">
                        <div className="flex gap-2 justify-end items-center">
                            {!hasSelectedAdSet && (
                                <Button
                                    onClick={() => {
                                        createGroup(
                                            `Ad set ${adSetGroups.length + 1}`
                                        );
                                    }}
                                >
                                    Create ad set
                                </Button>
                            )}

                            <Button
                                disabled={isDisabled}
                                loading={loadingState !== null}
                                loadingText={loadingText}
                                onClick={() => {
                                    if (isDisabled || loadingState !== null) {
                                        return;
                                    }

                                    submit();
                                }}
                                variant="primary"
                            >
                                {form.data.creatives.length > 0
                                    ? `Launch ${form.data.creatives.length} ad${
                                          form.data.creatives.length === 1
                                              ? ""
                                              : "s"
                                      }`
                                    : "Launch ads"}
                            </Button>
                        </div>
                    </div>
                    <DndContext
                        sensors={sensors}
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

                            let anyMoved = false; // track if any creative was actually moved

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

                                anyMoved = true; // mark that something changed
                            });

                            // Only show toast if at least one creative actually moved
                            if (anyMoved && targetGroupId !== "ungrouped") {
                                clearSelection();

                                const group = adSetGroups.find(
                                    (g) => g.id === targetGroupId
                                )!;

                                toast({
                                    contents: `${draggingCreatives.length} ${
                                        draggingCreatives.length > 1
                                            ? "creatives"
                                            : "creative"
                                    } added to "${group.label}"`,
                                });
                            }
                        }}
                    >
                        <UploadedCreativesContext.Provider
                            value={memoizedValue}
                        >
                            <div className="flex flex-col">
                                {(hasSelectedAdSet
                                    ? true
                                    : adSetGroups.length > 0) && (
                                    <div className="flex flex-col p-5 border-b border-gray-100">
                                        {hasSelectedAdSet ? (
                                            <AdSetGroup
                                                id={selectedAdSet!.id}
                                                label={selectedAdSet!.name}
                                                type="ADSET"
                                                creativeIds={
                                                    selectedAdSetCreatives
                                                }
                                                existingAdSet={selectedAdSet!}
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

                            <AdSetGroupSettingsPopup />
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
