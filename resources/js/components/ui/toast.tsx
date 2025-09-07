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
        <div className="bg-gray-900 shadow-popup text-white rounded-lg px-5 py-3.5 w-[var(--width)] flex items-center relative antialiased font-sans">
            <div className="font-semibold text-sm flex-1">{contents}</div>

            <button
                onClick={() => sonnerToast.dismiss(id)}
                className="-mr-1 flex items-center justify-center h-6 w-6 text-[11px] cursor-pointer"
            >
                <i className="fa-solid fa-close" />
            </button>
        </div>
    );
}
