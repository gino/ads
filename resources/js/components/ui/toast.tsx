import { useMemo } from "react";
import { toast as sonnerToast } from "sonner";

type ToastType = "SUCCESS" | "ERROR" | "LOADING";

interface Props {
    id: string | number;
    contents: string;
    type?: ToastType;
    progress?: number;
    dismissible?: boolean;
}

export function toast({
    dismissible = true,
    ...toast
}: Omit<Props, "id"> & { id?: string | number }) {
    const options: Parameters<typeof sonnerToast.custom>[1] = {
        position: "bottom-center",
        duration: toast.type === "LOADING" ? Infinity : 4000,
        dismissible,
    };

    if (toast.id !== undefined) {
        options.id = toast.id;
    } else {
        options.id = crypto.randomUUID();
    }

    return sonnerToast.custom(
        () => (
            <Toast
                id={options.id!}
                contents={toast.contents}
                type={toast.type}
                progress={toast.progress}
                dismissible={dismissible}
            />
        ),
        options
    );
}

function Toast({
    id,
    contents,
    type = "SUCCESS",
    progress,
    dismissible,
}: Props) {
    const icon = useMemo(() => {
        switch (type) {
            case "SUCCESS":
                return (
                    <i className="fa-solid fa-check-circle text-lg text-teal-700 shrink-0" />
                );
            case "ERROR":
                return (
                    <i className="fa-solid fa-circle-xmark text-lg text-red-700 shrink-0" />
                );
            case "LOADING":
                return (
                    <i className="fa-solid fa-spinner-third animate-spin text-lg text-gray-400 shrink-0" />
                );
        }
    }, [type]);

    return (
        <div className="shadow-base-popup bg-white rounded-xl px-4 py-3 w-[var(--width)] flex items-center relative antialiased font-sans">
            <div className="flex-1 flex items-center gap-3 truncate">
                {icon}
                <div className="flex items-center truncate flex-1 gap-3">
                    <div
                        title={contents}
                        className="font-semibold text-sm truncate flex-1"
                    >
                        {contents}
                    </div>

                    {typeof progress === "number" && (
                        <div className="font-semibold bg-gray-100 text-[12px] px-2 inline-block rounded-full leading-5">
                            {progress}%
                        </div>
                    )}
                </div>
            </div>
            {dismissible && (
                <button
                    onClick={() => sonnerToast.dismiss(id)}
                    className="-mr-1 flex items-center justify-center h-6 w-6 text-[11px] cursor-pointer text-gray-400 shrink-0"
                >
                    <i className="fa-solid fa-close" />
                </button>
            )}
        </div>
    );
}
