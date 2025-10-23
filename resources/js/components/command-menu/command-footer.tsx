export function CommandFooter() {
    return (
        <div className="bg-gray-50 px-4 py-3 shadow-base shrink-0">
            <div className="flex items-center justify-end gap-4">
                <div className="flex items-center gap-2">
                    <div className="text-[12px] font-semibold text-gray-400">
                        Jump to
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="h-4 w-4 rounded bg-gray-200/50 ring-1 ring-gray-200/50 flex items-center justify-center text-[11px] font-semibold text-gray-400">
                            <i className="fa-solid fa-arrow-turn-down-left text-[8px]" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="text-[12px] font-semibold text-gray-400">
                        Navigate
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="h-4 w-4 rounded bg-gray-200/50 ring-1 ring-gray-200/50 flex items-center justify-center text-[11px] font-semibold text-gray-400">
                            <i className="fa-solid fa-arrow-up text-[8px]" />
                        </div>
                        <div className="h-4 w-4 rounded bg-gray-200/50 ring-1 ring-gray-200/50 flex items-center justify-center text-[11px] font-semibold text-gray-400">
                            <i className="fa-solid fa-arrow-down text-[8px]" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="text-[12px] font-semibold text-gray-400">
                        Close menu
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="py-0 px-1 rounded bg-gray-200/50 ring-1 ring-gray-200/50 flex items-center justify-center text-[10px] font-semibold text-gray-400">
                            esc
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
