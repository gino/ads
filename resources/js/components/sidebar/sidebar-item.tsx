import { cn } from "@/lib/cn";

interface Props {
    icon: string;
    children: string;
}

export function SidebarItem({ icon, children }: Props) {
    return (
        <button className="px-3 cursor-pointer py-2.5 flex rounded-lg group w-full items-center gap-3 font-semibold hover:bg-gray-100 hover:ring-1 ring-gray-100">
            <i
                className={cn(
                    icon,
                    "text-base fa-regular fa-fw text-gray-400 group-hover:text-black"
                )}
            />
            <span className="text-gray-600 group-hover:text-black">
                {children}
            </span>
        </button>
    );
}
