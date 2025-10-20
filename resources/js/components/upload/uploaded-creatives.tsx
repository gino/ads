import { MouseSensor, PointerSensor, TouchSensor } from "@/lib/dnd-sensors";
import { base64ToFile } from "@/lib/utils";
import {
    AdSetGroupSettings,
    AdSetGroup as AdSetGroupType,
} from "@/pages/upload";
import { Portal } from "@ariakit/react";
import { DndContext, DragOverlay, useSensor } from "@dnd-kit/core";
import { router } from "@inertiajs/react";
import axios from "axios";
import { addHours } from "date-fns";
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
import { toast as sonnerToast } from "sonner";
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

export const defaultAdSetSettings: AdSetGroupSettings = {
    locations: ["US"],
    age: [18, 65],
    gender: "all",
    startDate: addHours(new Date(), 1),
};

interface Props {
    adSets: App.Data.AdSetData[];
}

export function UploadedCreatives({ adSets }: Props) {
    const { form, popupCreativeId, creatives, setCreatives } =
        useUploadContext();

    const [adSetGroups, setAdSetGroups] = useState<AdSetGroupType[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
            return creatives
                .map((c) => c.id)
                .filter((id) => !selectedAdSetCreatives.includes(id)); // ungrouped
        }

        // Otherwise, check adSetGroups
        for (const group of adSetGroups) {
            if (group.creatives.includes(referenceId)) return group.creatives;
        }

        // Ungrouped
        return creatives
            .map((c) => c.id)
            .filter((id) => !adSetGroups.some((g) => g.creatives.includes(id)));
    }, [
        selectedIds,
        adSetGroups,
        selectedAdSetCreatives,
        hasSelectedAdSet,
        creatives,
    ]);

    const toggleSelection = useCallback(
        (clickedId: string, e: MouseEvent) => {
            // Get the group that the clicked creative belongs to
            const currentGroup = getCreativesInCurrentGroup();

            // Determine if Shift-selection should be applied
            if (e.shiftKey) {
                // Find the last selected item in the current group as the anchor
                const lastSelectedInGroup = [...selectedIds]
                    .reverse()
                    .find((id) => currentGroup.includes(id));

                if (lastSelectedInGroup && currentGroup.includes(clickedId)) {
                    const startIndex =
                        currentGroup.indexOf(lastSelectedInGroup);
                    const endIndex = currentGroup.indexOf(clickedId);

                    if (startIndex !== -1 && endIndex !== -1) {
                        const [from, to] =
                            startIndex < endIndex
                                ? [startIndex, endIndex]
                                : [endIndex, startIndex];

                        const range = currentGroup.slice(from, to + 1);

                        // Replace selection with the range to preserve order
                        setSelectedIds(range);
                        return;
                    }
                }
            }

            // CMD/CTRL click: toggle selection of this creative
            if (e.metaKey || e.ctrlKey) {
                setSelectedIds((prev) =>
                    prev.includes(clickedId)
                        ? prev.filter((id) => id !== clickedId)
                        : [...prev, clickedId]
                );
                return;
            }

            // Normal click: select only this creative (and unselect if already selected)
            setSelectedIds((prev) =>
                prev.includes(clickedId) ? [] : [clickedId]
            );
        },
        [selectedIds, getCreativesInCurrentGroup]
    );

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
            return creatives
                .map((creative) => creative.id)
                .filter((id) => {
                    return !selectedAdSetCreatives.includes(id);
                });
        }

        return creatives
            .map((creative) => creative.id)
            .filter((id) => {
                return !adSetGroups.some((adSetGroup) => {
                    return adSetGroup.creatives.includes(id);
                });
            });
    }, [creatives, adSetGroups, hasSelectedAdSet, selectedAdSetCreatives]);

    const [activeId, setActiveId] = useState<string | null>(null);

    const draggingCreatives = useMemo(() => {
        if (!activeId) return [];
        if (selectedIds.includes(activeId)) {
            return creatives.filter((c) => selectedIds.includes(c.id));
        }
        return [creatives.find((c) => c.id === activeId)!];
    }, [activeId, selectedIds, creatives]);

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

    const enableHotKeys = popupAdSetId === null && popupCreativeId === null;

    // Hot keys
    useHotkeys(
        ["esc"],
        (e) => {
            e.preventDefault();
            clearSelection();
        },
        { enabled: enableHotKeys }
    );
    useHotkeys(
        ["meta+a", "ctrl+a"],
        (e) => {
            e.preventDefault();

            const allIds = creatives.map((c) => c.id);

            // If all are already selected, clear; otherwise, select all
            if (selectedIds.length === allIds.length) {
                setSelectedIds([]);
            } else {
                setSelectedIds(allIds);
            }
        },
        { enabled: enableHotKeys },
        [creatives, selectedIds]
    );
    useHotkeys(
        "shift+arrowup",
        (e) => {
            e.preventDefault();
            extendSelection("up");
        },
        { enabled: enableHotKeys },
        [extendSelection]
    );
    useHotkeys(
        "shift+arrowdown",
        (e) => {
            e.preventDefault();
            extendSelection("down");
        },
        { enabled: enableHotKeys },
        [extendSelection]
    );

    const isDisabled = useMemo(() => {
        if (!form.data.campaignId) return true;
        if (!form.data.pixelId) return true;
        if (!form.data.facebookPageId) return true;

        // Disable if no creatives at all
        if (creatives.length === 0) return true;

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
        creatives,
        ungroupedCreatives,
        adSetGroups,
    ]);

    const [isLoading, setIsLoading] = useState(false);

    const loadingText = useMemo(() => {
        if (!isLoading) {
            return null;
        }

        const adsLabel = `${creatives.length} ad${
            creatives.length === 1 ? "" : "s"
        }`;

        return `Launching ${adsLabel}...`;
    }, [isLoading, creatives.length, adSetGroups.length]);

    const submit = useCallback(async () => {
        const toastId = "upload-progress-toast";
        const creativePathsMap = new Map<
            string,
            { file: string; thumbnail: string | null }
        >();

        setIsLoading(true);
        try {
            let uploadedCreatives = 0;

            toast({
                id: toastId,
                type: "LOADING",
                contents: "Uploading creatives...",
                progress: 0,
                dismissible: false,
            });

            for (const creative of creatives) {
                const creativeLabel = creative.label || creative.name;
                const isVideo = creative.type.startsWith("video/");

                const formData = new FormData();
                formData.append("name", creativeLabel);
                formData.append("file", creative.file);

                if (isVideo) {
                    formData.append(
                        "thumbnail",
                        base64ToFile(
                            creative.thumbnail!,
                            `${creative.id}-thumb.jpg`
                        )
                    );
                }

                const response = await axios.post(
                    route("dashboard.upload.upload-photo"),
                    formData
                );

                creativePathsMap.set(creative.id, {
                    file: response.data.file,
                    thumbnail: response.data.thumbnail,
                });

                uploadedCreatives++;

                toast({
                    id: toastId,
                    type: "LOADING",
                    contents: `Uploading creatives (${uploadedCreatives}/${creatives.length})...`,
                    progress: Math.round(
                        (uploadedCreatives / creatives.length) * 100
                    ),
                    dismissible: false,
                });
            }

            const adSets = hasSelectedAdSet
                ? [
                      {
                          id: selectedAdSet!.id,
                          label: selectedAdSet!.name,
                          settings: defaultAdSetSettings,
                          creatives: creatives.map((c) => c.id),
                      },
                  ]
                : adSetGroups;

            await axios.post(route("dashboard.upload.create"), {
                adSets: adSets.map((adSet) => {
                    return {
                        id: adSet.id,
                        label: adSet.label,
                        settings: adSet.settings,
                        creatives: adSet.creatives.map((creativeId) => {
                            const creative = creatives.find(
                                (c) => c.id === creativeId
                            );
                            if (!creative) return;

                            const paths = creativePathsMap.get(creative.id);
                            if (!paths) return;

                            const creativeLabel =
                                creative.label || creative.name;

                            return {
                                id: creative.id,
                                label: creativeLabel,
                                path: paths,
                                settings: creative.settings,
                            };
                        }),
                    };
                }),
                hasSelectedAdSet,
                campaignId: form.data.campaignId,
                websiteUrl: form.data.websiteUrl,
                pixelId: form.data.pixelId,
                facebookPageId: form.data.facebookPageId,
                instagramPageId: form.data.instagramPageId,
                settings: form.data.settings,
                utmParameters: form.data.utmParameters,
            });

            sonnerToast.dismiss(toastId);
            toast({
                type: "SUCCESS",
                contents: `${creatives.length} ad${
                    creatives.length === 1 ? " is" : "s are"
                } being launched...`,
                description: "You can safely close this page.",
            });
            // setCreatives([]);
            // setAdSetGroups([]);
            router.reload({ only: ["adSets"] });
        } catch (err: any) {
            console.error(err);
            toast({
                id: toastId,
                type: "ERROR",
                contents:
                    err?.response?.data?.message ||
                    err?.message ||
                    "Something went wrong while launching ads",
            });
        } finally {
            setIsLoading(false);
        }
    }, [
        adSetGroups,
        creatives,
        hasSelectedAdSet,
        selectedAdSet,
        form.data.campaignId,
        form.data.websiteUrl,
        form.data.pixelId,
        form.data.facebookPageId,
        form.data.instagramPageId,
        form.data.settings,
        form.data.utmParameters,
        setIsLoading,
        setCreatives,
        setAdSetGroups,
    ]);

    return (
        <div className="p-1 min-w-0 h-full min-h-0 bg-gray-100 rounded-2xl ring-1 ring-inset shrink-0 ring-gray-200/30">
            <div className="flex overflow-hidden flex-col h-full min-h-0 bg-white rounded-xl shadow-base">
                <div className="overflow-y-auto flex-1 min-h-0">
                    <div className="p-5 border-b border-gray-100 flex items-center">
                        <div className="flex-1">
                            <Button
                                onClick={() => {
                                    router.visit(
                                        route(
                                            "dashboard.settings.ad-account.defaults"
                                        )
                                    );
                                }}
                            >
                                Configure defaults
                            </Button>
                        </div>
                        <div className="flex gap-2 items-center">
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
                                loading={isLoading}
                                loadingText={loadingText}
                                onClick={() => {
                                    if (isDisabled || isLoading) {
                                        return;
                                    }

                                    submit();
                                }}
                                variant="primary"
                            >
                                {creatives.length > 0
                                    ? `Launch ${creatives.length} ad${
                                          creatives.length === 1 ? "" : "s"
                                      }`
                                    : "Launch ads"}
                            </Button>
                        </div>
                    </div>
                    <div>
                        <DndContext
                            sensors={sensors}
                            onDragStart={({ active }) => {
                                if (
                                    !selectedIds.includes(active.id as string)
                                ) {
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

                                    if (currentGroupId === targetGroupId)
                                        return;

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
                                        contents: `${
                                            draggingCreatives.length
                                        } ${
                                            draggingCreatives.length > 1
                                                ? "creatives"
                                                : "creative"
                                        } added to "${
                                            hasSelectedAdSet
                                                ? selectedAdSet!.name
                                                : group.label
                                        }"`,
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
                                                    existingAdSet={
                                                        selectedAdSet!
                                                    }
                                                />
                                            ) : (
                                                adSetGroups.map(
                                                    (adSetGroup) => (
                                                        <AdSetGroup
                                                            key={adSetGroup.id}
                                                            id={adSetGroup.id}
                                                            label={
                                                                adSetGroup.label
                                                            }
                                                            type="ADSET"
                                                            creativeIds={
                                                                adSetGroup.creatives
                                                            }
                                                        />
                                                    )
                                                )
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
        </div>
    );
}

export function useUploadedCreativesContext() {
    return useContext(UploadedCreativesContext);
}
