import { Select } from "../ui/select";

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

interface Props {
    label?: string;
    value: string;
    onChange: (value: string) => void;
}

export function CallToActionInput({
    label = "Call-to-action",
    value,
    onChange,
}: Props) {
    return (
        <div>
            <Select
                label={label}
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
                    onChange(value as CallToActionType);
                }}
                value={value}
            />
        </div>
    );
}
