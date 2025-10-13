import { cn } from "@/lib/cn";
import { isInNoDndZone } from "@/lib/dnd-sensors";
import useDeferred from "@/lib/hooks/use-deferred";
import { useDroppable } from "@dnd-kit/core";
import { usePage } from "@inertiajs/react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import useMeasure from "react-use-measure";
import { toast } from "../ui/toast";
import { Tooltip } from "../ui/tooltip";
import { AdCreative, HEIGHT as ADCREATIVE_HEIGHT } from "./ad-creative";
import { useUploadContext } from "./upload-context";
import {
    defaultAdSetSettings,
    useUploadedCreativesContext,
} from "./uploaded-creatives";

export type FolderType = "ADSET" | "UNGROUPED";

interface Props {
    label: string;
    id: string | "ungrouped";
    type: FolderType;
    creativeIds: string[];
    className?: string;
    existingAdSet?: App.Data.AdSetData;
}

export function AdSetGroup({
    id,
    label,
    type,
    creativeIds,
    existingAdSet,
    className,
}: Props) {
    const { props } = usePage<{ countries: App.Data.TargetingCountryData[] }>();
    const { isLoading: isLoadingCountries } = useDeferred({
        data: ["countries"],
    });

    const isExistingAdSet = !!existingAdSet;

    const { isOver, setNodeRef, active } = useDroppable({
        id,
    });

    const { creatives } = useUploadContext();
    const {
        updateGroupLabel,
        deleteGroup,
        cloneGroup,
        setPopupAdSetId,
        getSettings,
    } = useUploadedCreativesContext();

    const attachedCreatives = useMemo(() => {
        return creatives.filter((creative) => {
            return creativeIds.includes(creative.id);
        });
    }, [creatives, creativeIds]);

    const [measureRef, { height }] = useMeasure();
    const [folded, setFolded] = useState(false);

    const [editingLabel, setEditingLabel] = useState(false);
    const [newLabel, setNewLabel] = useState(label);

    const updateLabel = useCallback(() => {
        setEditingLabel(false);

        const trimmedLabel = newLabel.trim();

        if (trimmedLabel.length > 0) {
            if (!isExistingAdSet) {
                updateGroupLabel(id, trimmedLabel);
                toast({
                    contents: `Ad set renamed to "${trimmedLabel}"`,
                });
            }
        } else {
            setNewLabel(label);
        }
    }, [id, label, newLabel, updateGroupLabel, isExistingAdSet]);

    const isOverGroup = useMemo(() => {
        if (!active) return;

        return isOver && !creativeIds.includes(active?.id.toString());
    }, [isOver, creativeIds, active]);

    const isAbleToEdit = type === "ADSET" && !isExistingAdSet;

    const settings = getSettings(id);

    const locations = useMemo(() => {
        if (isExistingAdSet) {
            return existingAdSet.countries;
        }

        return settings.locations;
    }, [settings.locations, isExistingAdSet, existingAdSet]);

    const namedLocations = useMemo(() => {
        if (!(locations.length > 0) || isLoadingCountries) {
            return [];
        }

        return locations.map((value) => {
            return props.countries.find((c) => c.countryCode === value)!;
        });
    }, [locations, isLoadingCountries]);

    const minAge = useMemo(() => {
        return settings.age[0];
    }, [settings.age]);

    const maxAge = useMemo(() => {
        const maxAge = settings.age[1];

        if (maxAge === 65) {
            return "65+";
        }

        return maxAge;
    }, [settings.age]);

    const isAgeModified = useMemo(() => {
        const [minAge, maxAge] = settings.age;
        const [defaultMinAge, defaultMaxAge] = defaultAdSetSettings.age;

        return minAge !== defaultMinAge || maxAge !== defaultMaxAge;
    }, [settings.age, defaultAdSetSettings.age]);

    return (
        <div
            className={cn(
                "rounded-xl",
                isOverGroup && "ring-2 ring-offset-2 ring-blue-100",
                "mb-2.5 last:mb-0",
                className
            )}
        >
            <div
                ref={setNodeRef}
                className="bg-gray-50 ring-inset ring-1 ring-gray-200/30 rounded-xl select-none"
            >
                <div
                    onClick={(e) => {
                        if (isInNoDndZone(e)) return;

                        setFolded((v) => !v);
                    }}
                    className="flex px-3.5 gap-3 items-center h-12 cursor-pointer"
                >
                    <div className="flex items-center flex-1 truncate">
                        <div className="flex items-center justify-center mr-2">
                            <i
                                className={cn(
                                    "fa-regular fa-angle-up text-gray-300 transition-transform duration-200 ease-in-out",
                                    isOverGroup
                                        ? "rotate-90"
                                        : folded && "rotate-180"
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
                                                data-no-dnd={isAbleToEdit}
                                                onDoubleClick={() => {
                                                    if (isAbleToEdit) {
                                                        setEditingLabel(true);
                                                    }
                                                }}
                                                className={cn(
                                                    "truncate",
                                                    isAbleToEdit &&
                                                        "cursor-text peer"
                                                )}
                                            >
                                                {label}
                                            </span>
                                            {isAbleToEdit && (
                                                <i className="fa-regular fa-pencil text-[12px] ml-2 text-gray-400 invisible peer-hover:visible" />
                                            )}
                                        </>
                                    ) : (
                                        <div className="p-px">
                                            <input
                                                type="text"
                                                data-no-dnd
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
                        <div className="flex items-center gap-1.5">
                            {isAgeModified && type === "ADSET" && (
                                <div className="font-semibold text-blue-950 bg-blue-500/10 text-[12px] px-2 pl-1.5 inline-flex items-center rounded-full leading-5 ring-1 ring-inset ring-blue-900/10">
                                    <i className="fa-regular fa-user mr-0.5 text-[10px]" />
                                    <span>
                                        {minAge} - {maxAge}
                                    </span>
                                </div>
                            )}

                            {locations.length > 0 && type === "ADSET" && (
                                <Tooltip
                                    content={
                                        <div className="px-3.5 py-2.5">
                                            <div className="font-semibold mb-2">
                                                Selected locations (
                                                {namedLocations.length}):
                                            </div>
                                            <ul className="list-disc list-inside space-y-2">
                                                {namedLocations.map(
                                                    (location) => (
                                                        <li
                                                            key={
                                                                location.countryCode
                                                            }
                                                            className="font-semibold"
                                                        >
                                                            {location.name}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    }
                                    className="min-w-64"
                                >
                                    <div className="font-semibold text-purple-950 bg-purple-500/10 text-[12px] px-2 pl-1 inline-flex items-center rounded-full leading-5 ring-1 ring-inset ring-purple-900/10 cursor-help">
                                        <i className="fa-regular fa-location-dot mr-0.5 text-[10px]" />
                                        <span>
                                            {locations[0]}
                                            {locations.length > 1 &&
                                                ` +${locations.length - 1}`}
                                        </span>
                                    </div>
                                </Tooltip>
                            )}

                            <div className="font-semibold bg-gray-200/50 text-[12px] px-2 inline-block rounded-full leading-5">
                                {attachedCreatives.length} creative
                                {attachedCreatives.length === 1 ? "" : "s"}
                            </div>
                        </div>

                        {type === "ADSET" && !isExistingAdSet && (
                            <>
                                <div className="w-px h-4 bg-gray-200/50 mx-3" />
                                <div
                                    data-no-dnd
                                    className="flex items-center gap-1"
                                >
                                    <>
                                        <button
                                            onClick={() => {
                                                setPopupAdSetId(id);
                                            }}
                                            className="cursor-pointer active:scale-[0.99] transition-transform duration-100 ease-in-out hover:bg-gray-200/50 text-gray-400 hover:text-black h-6 w-6 text-[12px] flex items-center justify-center rounded-[5px]"
                                        >
                                            <i className="fa-regular fa-cog" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                cloneGroup(id);
                                            }}
                                            className="cursor-pointer active:scale-[0.99] transition-transform duration-100 ease-in-out hover:bg-gray-200/50 text-gray-400 hover:text-black h-6 w-6 text-[12px] flex items-center justify-center rounded-[5px]"
                                        >
                                            <i className="fa-regular fa-clone" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (
                                                    attachedCreatives.length > 0
                                                ) {
                                                    if (
                                                        confirm(
                                                            "Are you sure you want to delete this ad set? Any attached creatives will be ungrouped."
                                                        )
                                                    ) {
                                                        deleteGroup(id);
                                                    }
                                                    return;
                                                }

                                                deleteGroup(id);
                                            }}
                                            className="cursor-pointer active:scale-[0.99] transition-transform duration-100 ease-in-out hover:bg-gray-200/50 text-gray-400 hover:text-red-700 h-6 w-6 text-[12px] flex items-center justify-center rounded-[5px]"
                                        >
                                            <i className="fa-regular fa-trash-can" />
                                        </button>
                                    </>
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
                                        : attachedCreatives.length > 0
                                        ? height
                                        : 0,
                                    marginTop:
                                        attachedCreatives.length > 0 ? -8 : 0,
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
                                {/* {isOverGroup && (
                                    <div className="absolute inset-2 rounded-lg text-xs font-semibold text-gray-600 border-2 border-dashed border-gray-200 flex items-center justify-center">
                                        <div>Drop your creatives here</div>
                                    </div>
                                )} */}

                                <div ref={measureRef} className="relative">
                                    <div className="flex flex-col gap-2 p-2">
                                        {attachedCreatives.map((creative) => (
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
