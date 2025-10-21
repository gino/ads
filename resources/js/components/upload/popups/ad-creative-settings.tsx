import {
    CallToActionInput,
    CallToActionType,
} from "@/components/shared-inputs/call-to-action-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { CreativeSettings } from "@/pages/upload";
import { useForm } from "@inertiajs/react";
import { useCallback, useMemo } from "react";
import { useUploadContext } from "../upload-context";

function AdCreativeSettings() {
    const {
        popupCreativeId,
        setPopupCreativeId,
        getCreativeSettings,
        updateCreativeSetting,
        setCreativeLabel,
        creatives,
    } = useUploadContext();

    const creative = useMemo(() => {
        if (!popupCreativeId) return;
        return creatives.find((c) => c.id === popupCreativeId);
    }, [popupCreativeId, creatives]);

    const { cta, primaryTexts, headlines, descriptions } = getCreativeSettings(
        popupCreativeId!
    );

    const form = useForm<CreativeSettings & { name: string }>({
        name: creative?.label || creative?.name || "",
        primaryTexts,
        headlines,
        descriptions,
        cta,
    });

    const isDisabled = useMemo(() => {
        const hasName = form.data.name?.trim().length > 0;
        const hasCta = form.data.cta;
        return !(hasName && hasCta);
    }, [form.data.name, form.data.cta]);

    const saveChanges = useCallback(
        (creativeId: string) => {
            updateCreativeSetting(
                creativeId,
                "primaryTexts",
                form.data.primaryTexts
            );
            updateCreativeSetting(creativeId, "headlines", form.data.headlines);
            updateCreativeSetting(
                creativeId,
                "descriptions",
                form.data.descriptions
            );
            updateCreativeSetting(creativeId, "cta", form.data.cta);
        },
        [
            form.data.primaryTexts,
            form.data.headlines,
            form.data.descriptions,
            form.data.cta,
        ]
    );

    const applyToAll = useCallback(() => {
        for (const creative of creatives) {
            saveChanges(creative.id);
        }

        if (form.isDirty) {
            const amount = creatives.length;
            toast({
                contents: `Settings updated for ${amount} creative${
                    amount === 1 ? "" : "s"
                }`,
            });
        }
    }, [saveChanges, creatives, form.isDirty]);

    const submit = useCallback(() => {
        if (isDisabled) {
            return;
        }

        if (form.data.name?.trim().length > 0) {
            setCreativeLabel(popupCreativeId!, form.data.name.trim());
        }

        saveChanges(popupCreativeId!);
        setPopupCreativeId(null);

        if (form.isDirty) {
            toast({
                contents: `Settings updated for "${
                    form.data.name || creative?.label || creative?.name
                }"`,
            });
        }
    }, [
        isDisabled,
        form.data.name,
        form.isDirty,
        popupCreativeId,
        creative?.label,
        creative?.name,
        setCreativeLabel,
        updateCreativeSetting,
        saveChanges,
        setPopupCreativeId,
        toast,
    ]);

    const maxVariations = 5;

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                submit();
            }}
        >
            <div className="p-5 border-b border-gray-100">
                <label>
                    <span className="block mb-2 font-semibold">Name of ad</span>
                    <Input
                        type="text"
                        value={form.data.name}
                        placeholder={creative?.label || creative?.name}
                        onChange={(e) => {
                            form.setData("name", e.target.value);
                        }}
                        required
                    />
                </label>
            </div>
            <div className="p-5 border-b border-gray-100">
                <label className="block -mb-1">
                    <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold">Primary text</div>
                        <div className="font-semibold flex items-center bg-gray-100 text-[12px] px-2 rounded-full leading-5">
                            {Math.max(form.data.primaryTexts.length, 1)} of{" "}
                            {maxVariations}
                        </div>
                    </div>
                    <Textarea
                        value={form.data.primaryTexts[0] || ""}
                        onChange={(e) => {
                            form.setData("primaryTexts.0", e.target.value);
                        }}
                        placeholder="Tell people what your ad is about"
                    />
                </label>

                <TextVariations
                    type="textarea"
                    texts={form.data.primaryTexts}
                    onChange={(key, values) => {
                        form.setData((`primaryTexts` + key) as any, values);
                    }}
                    placeholder="Add another option for the primary text"
                    maxVariations={maxVariations}
                />
            </div>
            <div className="p-5 border-b border-gray-100">
                <label>
                    <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold">Headline</div>
                        <div className="font-semibold flex items-center bg-gray-100 text-[12px] px-2 rounded-full leading-5">
                            {Math.max(form.data.headlines.length, 1)} of{" "}
                            {maxVariations}
                        </div>
                    </div>
                    <Input
                        type="text"
                        value={form.data.headlines[0] || ""}
                        onChange={(e) => {
                            form.setData("headlines.0", e.target.value);
                        }}
                        placeholder="Write a short headline"
                    />
                </label>

                <TextVariations
                    type="input"
                    texts={form.data.headlines}
                    onChange={(key, values) => {
                        form.setData((`headlines` + key) as any, values);
                    }}
                    placeholder="Add another option for the headline"
                    maxVariations={maxVariations}
                />
            </div>
            <div className="p-5 border-b border-gray-100">
                <label className="block -mb-1">
                    <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold">Description</div>
                        <div className="font-semibold flex items-center bg-gray-100 text-[12px] px-2 rounded-full leading-5">
                            {Math.max(form.data.descriptions.length, 1)} of{" "}
                            {maxVariations}
                        </div>
                    </div>
                    <Textarea
                        value={form.data.descriptions[0] || ""}
                        onChange={(e) => {
                            form.setData("descriptions.0", e.target.value);
                        }}
                        placeholder="Add additional information"
                    />
                </label>
                <TextVariations
                    type="textarea"
                    texts={form.data.descriptions}
                    onChange={(key, values) => {
                        form.setData((`descriptions` + key) as any, values);
                    }}
                    placeholder="Add another option for the description"
                    maxVariations={maxVariations}
                />
            </div>
            <div className="p-5">
                <CallToActionInput
                    value={form.data.cta}
                    onChange={(value) => {
                        form.setData("cta", value as CallToActionType);
                    }}
                />
            </div>

            {/* Modal footer */}
            <div className="p-5 sticky bottom-0 border-t border-gray-100 bg-white">
                <div className="flex gap-2 justify-end items-center">
                    {creatives.length > 1 && (
                        <div className="flex-1">
                            <Button
                                disabled={isDisabled}
                                onClick={() => {
                                    if (isDisabled) {
                                        return;
                                    }

                                    applyToAll();
                                    setPopupCreativeId(null);
                                }}
                            >
                                Apply to all creatives
                            </Button>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => {
                                setPopupCreativeId(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={isDisabled}
                        >
                            Save changes
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}

export function AdCreativeSettingsPopup() {
    const { popupCreativeId, setPopupCreativeId } = useUploadContext();

    return (
        <Modal
            open={popupCreativeId !== null}
            setOpen={(value) => {
                if (!value) {
                    setPopupCreativeId(null);
                }
            }}
            hideOnInteractOutside={false}
        >
            <AdCreativeSettings />
        </Modal>
    );
}

interface TextVariationsProps {
    type: "input" | "textarea";
    texts: string[];
    placeholder: string;
    maxVariations: number;
    onChange: (key: string, values: string[] | string) => void;
}

function TextVariations({
    type,
    texts,
    placeholder,
    maxVariations,
    onChange,
}: TextVariationsProps) {
    return (
        <>
            <div>
                {Array(Math.max(0, texts?.length - 1))
                    .fill(null)
                    .map((_, index) => (
                        <div
                            key={index}
                            className="first:mt-2 mt-2.5 flex gap-2 relative"
                        >
                            {type === "textarea" ? (
                                <>
                                    <Textarea
                                        value={texts[index + 1] || ""}
                                        onChange={(e) => {
                                            onChange(
                                                `.${index + 1}`,
                                                e.target.value
                                            );
                                        }}
                                        placeholder={placeholder}
                                        className="min-h-16"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const arr = texts;
                                            arr.splice(index + 1, 1);
                                            onChange("", arr);
                                        }}
                                        className="h-7 w-7 hover:bg-gray-100 rounded-md cursor-pointer text-gray-300 hover:text-black shrink-0 text-[12px] flex items-center justify-center ring-1 active:scale-[0.99] transition-transform duration-100 ease-in-out ring-transparent hover:ring-gray-100 absolute right-1.5 top-1.5"
                                    >
                                        <i className="fa-solid fa-times" />
                                    </button>
                                </>
                            ) : (
                                type === "input" && (
                                    <>
                                        <Input
                                            type="text"
                                            value={texts[index + 1] || ""}
                                            onChange={(e) => {
                                                onChange(
                                                    `.${index + 1}`,
                                                    e.target.value
                                                );
                                            }}
                                            placeholder={placeholder}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const arr = texts;
                                                arr.splice(index + 1, 1);
                                                onChange("", arr);
                                            }}
                                            className="h-7 w-7 hover:bg-gray-100 rounded-md cursor-pointer text-gray-300 hover:text-black shrink-0 text-[12px] flex items-center justify-center ring-1 active:scale-[0.99] transition-transform duration-100 ease-in-out ring-transparent hover:ring-gray-100 absolute right-1.5 top-1/2 -translate-y-1/2"
                                        >
                                            <i className="fa-solid fa-times" />
                                        </button>
                                    </>
                                )
                            )}
                        </div>
                    ))}
            </div>
            {!(texts.length >= maxVariations) && (
                <div className="mt-2 flex justify-end">
                    <Button
                        onClick={() => {
                            onChange(`.${Math.max(texts.length, 1)}`, "");
                        }}
                        icon="fa-solid fa-plus text-[12px]"
                    >
                        Add variation
                    </Button>
                </div>
            )}
        </>
    );
}
