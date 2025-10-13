import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { CreativeSettings } from "@/pages/upload";
import { useForm } from "@inertiajs/react";
import { useCallback, useEffect, useMemo } from "react";
import { useUploadContext } from "../upload-context";

// https://chatgpt.com/c/68e12406-2794-8328-a5ec-f5ce4fc1c3bc
const ctaTypes = {
    DOWNLOAD: "Download",
    GET_OFFER: "Get Offer",
    GET_QUOTE: "Get Quote",
    GET_SHOWTIMES: "Get Showtimes",
    LEARN_MORE: "Learn More",
    LISTEN_NOW: "Listen Now",
    ORDER_NOW: "Order Now",
    PLAY_GAME: "Play Game",
    REQUEST_TIME: "Request Time",
    START_ORDER: "Start Order",
    SHOP_NOW: "Shop Now",
    SIGN_UP: "Sign Up",
    SUBSCRIBE: "Subscribe",
    SEE_MORE: "See More",
    APPLY_NOW: "Apply Now",
    BOOK_NOW: "Book Now",
    BUY_TICKETS: "Buy Tickets",
    CONTACT_US: "Contact Us",
} as const;

export type CallToActionType = keyof typeof ctaTypes;

export function AdCreativeSettingsPopup() {
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
        name: "",
        primaryTexts,
        headlines,
        descriptions,
        cta,
    });

    useEffect(() => {
        if (!popupCreativeId || !creative) return;
        // Do this for every property inside of `form`
        form.setData("name", creative.label || creative.name);
        form.setData("cta", cta);
        form.setData("primaryTexts", primaryTexts);
        form.setData("headlines", headlines);
        form.setData("descriptions", descriptions);
    }, [popupCreativeId, creative, cta, primaryTexts, headlines, descriptions]);

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
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    submit();
                }}
            >
                <div className="p-5 border-b border-gray-100">
                    <label>
                        <span className="block mb-2 font-semibold">
                            Name of ad
                        </span>
                        <input
                            type="text"
                            value={form.data.name}
                            placeholder={creative?.label || creative?.name}
                            onChange={(e) =>
                                form.setData("name", e.target.value)
                            }
                            required
                            className="w-full px-3.5 py-2.5 bg-white rounded-lg ring-1 ring-gray-200 placeholder-gray-400 font-semibold focus:ring-2 outline-none focus:ring-offset-1 focus:ring-offset-blue-100 focus:ring-blue-100 transition duration-150 ease-in-out"
                        />
                    </label>
                </div>
                <div className="p-5 border-b border-gray-100">
                    <label>
                        <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold">Primary text</div>
                            <div className="font-semibold flex items-center bg-gray-100 text-[12px] px-2 rounded-full leading-5">
                                {Math.max(form.data.primaryTexts.length, 1)} of
                                5
                            </div>
                        </div>
                        <textarea
                            value={form.data.primaryTexts[0] || ""}
                            onChange={(e) => {
                                form.setData("primaryTexts.0", e.target.value);
                            }}
                            placeholder="Tell people what your ad is about"
                            className="ring-1 ring-gray-200 resize-none rounded-lg bg-white px-3.5 py-2.5 w-full scroll-py-2.5 scroll-px-3.5 min-h-24 field-sizing-content placeholder-gray-400 font-semibold placeholder-shown:font-semibold focus:ring-2 outline-none focus:ring-offset-1 focus:ring-offset-blue-100 focus:ring-blue-100 transition duration-150 ease-in-out"
                        />
                    </label>

                    {/* <div className="mt-2 flex justify-end">
                        <Button icon="fa-regular fa-plus">
                            Add text variation
                        </Button>
                    </div> */}
                </div>
                <div className="p-5 border-b border-gray-100">
                    <label>
                        <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold">Headline</div>
                            <div className="font-semibold flex items-center bg-gray-100 text-[12px] px-2 rounded-full leading-5">
                                1 of 5
                            </div>
                        </div>
                        <input
                            type="text"
                            value={form.data.headlines[0] || ""}
                            onChange={(e) => {
                                form.setData("headlines.0", e.target.value);
                            }}
                            placeholder="Write a short headline"
                            className="w-full px-3.5 py-2.5 bg-white rounded-lg ring-1 ring-gray-200 placeholder-gray-400 font-semibold focus:ring-2 outline-none focus:ring-offset-1 focus:ring-offset-blue-100 focus:ring-blue-100 transition duration-150 ease-in-out"
                        />
                    </label>
                    {/* <div className="mt-2 flex justify-end">
                        <Button icon="fa-regular fa-plus">
                            Add text variation
                        </Button>
                    </div> */}
                </div>
                <div className="p-5 border-b border-gray-100">
                    <label>
                        <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold">Description</div>
                            <div className="font-semibold flex items-center bg-gray-100 text-[12px] px-2 rounded-full leading-5">
                                1 of 5
                            </div>
                        </div>
                        <textarea
                            value={form.data.descriptions[0] || ""}
                            onChange={(e) => {
                                form.setData("descriptions.0", e.target.value);
                            }}
                            placeholder="Add additional information"
                            className="ring-1 ring-gray-200 resize-none rounded-lg bg-white px-3.5 py-2.5 w-full scroll-py-2.5 scroll-px-3.5 h-16 placeholder-gray-400 font-semibold placeholder-shown:font-semibold focus:ring-2 outline-none focus:ring-offset-1 focus:ring-offset-blue-100 focus:ring-blue-100 transition duration-150 ease-in-out"
                        />
                    </label>
                    {/* <div className="mt-2 flex justify-end">
                        <Button icon="fa-regular fa-plus">
                            Add text variation
                        </Button>
                    </div> */}
                </div>
                <div className="p-5">
                    <div>
                        <Select
                            label="Call-to-action"
                            items={Object.entries(ctaTypes)}
                            getItem={([cta, label]) => {
                                return {
                                    label: (
                                        <div className="flex flex-1 gap-3 items-center mr-1 text-left truncate">
                                            <div className="flex-1 truncate">
                                                <div className="font-semibold truncate">
                                                    {label}
                                                </div>
                                            </div>

                                            {["SHOP_NOW"].includes(cta) && (
                                                <div className="font-semibold bg-gray-100 text-[12px] px-2 inline-block rounded-full leading-5 group-hover:bg-gray-200 group-data-[selected='true']:bg-black/5 group-data-[active-item]:bg-gray-200">
                                                    Recommended
                                                </div>
                                            )}
                                        </div>
                                    ),
                                    value: cta,
                                };
                            }}
                            getSelectedItem={([_, label]) => (
                                <div className="font-semibold">{label}</div>
                            )}
                            onChange={(value) => {
                                form.setData("cta", value as CallToActionType);
                            }}
                            value={form.data.cta}
                        />
                    </div>
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
        </Modal>
    );
}
