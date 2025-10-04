import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select2 } from "@/components/ui/select2";
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
    } = useUploadContext();

    const { cta } = getCreativeSettings(popupCreativeId!);

    const form = useForm<CreativeSettings>({
        cta,
    });

    useEffect(() => {
        if (!popupCreativeId) return;
        // Do this for every property inside of `form`
        form.setData("cta", cta);
    }, [popupCreativeId, cta]);

    const isDisabled = useMemo(() => {
        if (form.data.cta) {
            return false;
        }

        return true;
    }, [form.data.cta]);

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
                {JSON.stringify(form.data.cta)}
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

                            updateCreativeSetting(
                                popupCreativeId!,
                                "cta",
                                form.data.cta
                            );
                            setPopupCreativeId(null);
                        }}
                    >
                        Save changes
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
