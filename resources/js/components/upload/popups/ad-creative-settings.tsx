import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select2 } from "@/components/ui/select2";
import { toast } from "@/components/ui/toast";
import { CreativeSettings } from "@/pages/upload";
import { useForm } from "@inertiajs/react";
import { useEffect, useMemo } from "react";
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
        form: uploadForm,
    } = useUploadContext();

    const creative = useMemo(() => {
        if (!popupCreativeId) return;
        return uploadForm.data.creatives.find((c) => c.id === popupCreativeId);
    }, [popupCreativeId, uploadForm.data.creatives]);

    const { cta } = getCreativeSettings(popupCreativeId!);

    const form = useForm<CreativeSettings & { name: string }>({
        name: "",
        cta,
    });

    useEffect(() => {
        if (!popupCreativeId || !creative) return;
        // Do this for every property inside of `form`
        form.setData("name", creative.label || creative.name);
        form.setData("cta", cta);
    }, [popupCreativeId, creative, cta]);

    const isDisabled = useMemo(() => {
        const hasName = form.data.name?.trim().length > 0;
        const hasCta = form.data.cta;
        return !(hasName && hasCta);
    }, [form.data.name, form.data.cta]);

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
            <div className="p-5 border-b border-gray-100">
                <label>
                    <span className="block mb-2 font-semibold">Name of ad</span>
                    <input
                        type="text"
                        value={form.data.name}
                        placeholder={creative?.label || creative?.name}
                        onChange={(e) => form.setData("name", e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white rounded-lg ring-1 ring-gray-200 placeholder-gray-400 font-semibold focus:ring-2 outline-none focus:ring-offset-1 focus:ring-offset-blue-100 focus:ring-blue-100 transition duration-150 ease-in-out"
                    />
                </label>
            </div>
            <div className="p-5">
                <div>
                    <Select2
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
                                            <div className="font-semibold bg-gray-100 text-[12px] px-2 inline-block rounded-full leading-5 group-data-[active-item]:bg-gray-200">
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
                    <Button
                        onClick={() => {
                            setPopupCreativeId(null);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        disabled={isDisabled}
                        onClick={() => {
                            if (isDisabled) {
                                return;
                            }

                            if (form.data.name?.trim().length > 0) {
                                setCreativeLabel(
                                    popupCreativeId!,
                                    form.data.name.trim()
                                );
                            }

                            updateCreativeSetting(
                                popupCreativeId!,
                                "cta",
                                form.data.cta
                            );
                            setPopupCreativeId(null);

                            if (form.isDirty) {
                                toast({
                                    contents: `Settings updated for "${
                                        form.data.name ||
                                        creative?.label ||
                                        creative?.name
                                    }"`,
                                });
                            }
                        }}
                    >
                        Save changes
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
