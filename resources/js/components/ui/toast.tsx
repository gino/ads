import { toast as sonnerToast } from "sonner";

export function toast(toast: Omit<Props, "id">) {
    return sonnerToast.custom(
        (id) => <Toast id={id} contents={toast.contents} />,
        {
            position: "bottom-center",
        }
    );
}

interface Props {
    id: string | number;
    contents: string;
}

function Toast({ id, contents }: Props) {
    return (
        <div className="shadow-base-popup bg-white rounded-xl px-4 py-3 w-[var(--width)] flex items-center relative antialiased font-sans">
            <div className="flex-1 flex items-center gap-4">
                <div className="flex items-center justify-center h-[15px] w-[15px] rounded-full bg-white text-base">
                    <i className="fa-solid fa-check-circle text-emerald-600" />
                </div>
                <div className="font-semibold text-sm">{contents}</div>
            </div>
            <button
                onClick={() => sonnerToast.dismiss(id)}
                className="-mr-1 flex items-center justify-center h-6 w-6 text-[11px] cursor-pointer text-gray-400"
            >
                <i className="fa-solid fa-close" />
            </button>
        </div>
    );

    return (
        <div className="bg-white shadow-base-popup rounded-xl px-4 py-3 w-[var(--width)] flex items-center relative antialiased font-sans">
            <div className="flex-1 flex items-center gap-4">
                <div className="flex items-center justify-center h-[15px] w-[15px] rounded-full bg-white text-base">
                    <i className="fa-solid fa-check-circle text-sky-500" />
                </div>
                <div className="font-semibold text-sm">{contents}</div>
            </div>
            <button
                onClick={() => sonnerToast.dismiss(id)}
                className="-mr-1 flex items-center justify-center h-6 w-6 text-[11px] cursor-pointer text-gray-400"
            >
                <i className="fa-solid fa-close" />
            </button>
        </div>
    );
}
