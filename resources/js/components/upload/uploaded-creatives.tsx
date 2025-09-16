import { cn } from "@/lib/cn";
import { UploadForm as UploadFormType } from "@/pages/upload";
import { DndContext } from "@dnd-kit/core";
import { InertiaFormProps } from "@inertiajs/react";
import { useState } from "react";
import { AdSetGroup } from "./adset-group";

interface Props {
    form: InertiaFormProps<UploadFormType>;
}

export function UploadedCreatives({ form }: Props) {
    const [adSetGroups, setAdSetGroups] = useState([
        {
            id: "adset-1",
            label: "Ad set 1",
        },
        {
            id: "adset-2",
            label: "Ad set 2",
        },
        {
            id: "adset-3",
            label: "Ad set 3",
        },
    ]);

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
                    onDragEnd={(event) => {
                        const creative = event.active;
                        const adSetGroup = event.over;

                        console.log({ creative, adSetGroup });
                    }}
                >
                    <div className="flex-1 min-h-0 overflow-y-auto">
                        <div className="p-5 flex flex-col">
                            <div className="flex flex-col">
                                {adSetGroups.map((adSetGroup) => (
                                    <AdSetGroup
                                        key={adSetGroup.id}
                                        id={adSetGroup.id}
                                        label={adSetGroup.label}
                                        type="ADSET"
                                        creatives={form.data.creatives}
                                        className={cn(
                                            form.data.creatives.length === 0
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
                                    label="Ungrouped creatives"
                                    type="UNGROUPED"
                                    creatives={form.data.creatives}
                                />
                            </div>
                        </div>
                    </div>
                </DndContext>
            </div>
        </div>
    );
}
