import { ReactNode } from "react";

interface Props {
    label: string;
    keys: readonly ReactNode[];
}

export function ShortcutKeyHint({ label, keys }: Props) {
    return (
        <div className="flex items-center gap-2">
            <div className="text-[12px] font-semibold text-gray-500">
                {label}
            </div>
            <div className="flex items-center gap-1">
                {keys.map((key, index) => (
                    <div
                        key={index}
                        className="py-0 px-1 rounded bg-gray-200/50 ring-1 ring-gray-200/50 flex items-center justify-center text-[10px] font-semibold text-gray-500"
                    >
                        {key}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ShortcutIconHint({ label, keys }: Props) {
    return (
        <div className="flex items-center gap-2">
            <div className="text-[12px] font-semibold text-gray-500">
                {label}
            </div>
            <div className="flex items-center gap-1">
                {keys.map((key, index) => (
                    <div
                        key={index}
                        className="h-4 w-4 rounded bg-gray-200/50 ring-1 ring-gray-200/50 flex items-center justify-center text-[11px] font-semibold text-gray-500"
                    >
                        {key}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ShortcutButtonHint({ label, keys }: Props) {
    return (
        <button className="flex items-center gap-2 cursor-pointer hover:bg-gray-200/50 ring-1 hover:ring-gray-200/50 ring-transparent px-2 pr-1.5 py-1 -my-1 rounded-md group -mr-1.5 -ml-2 active:scale-[0.99] transition-transform duration-150 ease-in-out">
            <div className="text-[12px] font-semibold text-gray-500 group-hover:text-black">
                {label}
            </div>
            <div className="flex items-center gap-1">
                {keys.map((key, index) => (
                    <div
                        key={index}
                        className="h-4 w-4 rounded bg-gray-200/50 ring-1 ring-gray-200/50 flex items-center justify-center text-[11px] font-semibold text-gray-500 group-hover:text-black group-hover:bg-gray-200 group-hover:ring-gray-200"
                    >
                        {key}
                    </div>
                ))}
            </div>
        </button>
    );
}
