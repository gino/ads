import { cn } from "@/lib/cn";
import { UploadForm as UploadFormType } from "@/pages/upload";
import { Portal } from "@ariakit/react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { InertiaFormProps } from "@inertiajs/react";
import { useMemo, useState } from "react";
import { AdCreative } from "./ad-creative";
import { AdSetGroup } from "./adset-group";

interface Props {
    form: InertiaFormProps<UploadFormType>;
}

export function UploadedCreatives({ form }: Props) {
    const [adSetGroups, setAdSetGroups] = useState([
        {
            id: "adset-1",
            label: "Ad set 1",
            creatives: [] as string[],
        },
        {
            id: "adset-2",
            label: "Ad set 2",
            creatives: [] as string[],
        },
        {
            id: "adset-3",
            label: "Ad set 3",
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

    const draggingCreative = useMemo(() => {
        return form.data.creatives.find(
            (creative) => creative.id === activeId
        )!;
    }, [form.data.creatives, activeId]);

    return (
        <div className="min-w-0 p-1 bg-gray-100 rounded-2xl shrink-0 ring-inset ring-1 ring-gray-200/30 h-full min-h-0">
            <div className="bg-white shadow-base rounded-xl overflow-hidden h-full flex flex-col min-h-0">
                <div className="p-5 border-b border-gray-100">
                    <div className="flex justify-end">
                        <button className="bg-white font-semibold shadow-base px-3.5 py-2 rounded-md cursor-pointer active:scale-[0.99] transition-transform duration-100 ease-in-out">
                            Create ad set
                        </button>
                    </div>
                </div>
                <DndContext
                    onDragStart={(event) =>
                        setActiveId(event.active.id as string)
                    }
                    onDragCancel={() => setActiveId(null)}
                    onDragEnd={(event) => {
                        setActiveId(null);

                        const { over, active } = event;
                        if (!over) return;

                        const creativeId = active.id as string;
                        const targetAdSetId = over.id as string;

                        if (!creativeId || !targetAdSetId) return;

                        setAdSetGroups((prev) => {
                            const cleared = prev.map((group) => ({
                                ...group,
                                creatives: group.creatives.filter(
                                    (id) => id !== creativeId
                                ),
                            }));

                            // if dropped on ungrouped, don’t add to any adset
                            if (targetAdSetId === "ungrouped") return cleared;

                            return cleared.map((group) =>
                                group.id === targetAdSetId
                                    ? {
                                          ...group,
                                          creatives: [
                                              ...group.creatives,
                                              creativeId,
                                          ],
                                      }
                                    : group
                            );
                        });
                    }}
                >
                    <div className="flex-1 min-h-0 overflow-y-auto">
                        <div className="p-5 flex flex-col">
                            <div className="flex flex-col">
                                {adSetGroups.map((adSetGroup) => (
                                    <AdSetGroup
                                        key={adSetGroup.id}
                                        form={form}
                                        id={adSetGroup.id}
                                        label={adSetGroup.label}
                                        type="ADSET"
                                        creativeIds={adSetGroup.creatives}
                                        className={cn(
                                            adSetGroup.creatives.length === 0
                                                ? "mb-2.5"
                                                : "mb-5",
                                            "last:mb-0"
                                        )}
                                    />
                                ))}
                            </div>

                            <div className="border-t border-gray-100 pt-5 mt-5">
                                <AdSetGroup
                                    id="ungrouped"
                                    form={form}
                                    label="Ungrouped creatives"
                                    type="UNGROUPED"
                                    creativeIds={ungroupedCreatives}
                                />
                            </div>
                        </div>
                    </div>
                    <Portal>
                        <DragOverlay>
                            {activeId && (
                                <AdCreative
                                    form={form}
                                    creative={draggingCreative}
                                    isDragging
                                />
                            )}
                        </DragOverlay>
                    </Portal>
                </DndContext>
            </div>
        </div>
    );
}
