import { Column, RowSelectionState } from "@tanstack/react-table";
import { createParser } from "nuqs";
import { CSSProperties } from "react";

// Custom nuqs parser to handle row selection in URL as query param (https://nuqs.47ng.com)
export const parseAsRowSelection = createParser<RowSelectionState>({
    parse(queryValue) {
        if (!queryValue) return {};

        try {
            // Split by comma to get individual IDs
            const selectedIds = queryValue
                .split(",")
                .filter((id) => id.trim() !== "");

            // Convert to { id: true } format
            return selectedIds.reduce((acc, id) => {
                acc[id.trim()] = true;
                return acc;
            }, {} as RowSelectionState);
        } catch {
            return {};
        }
    },

    serialize(value) {
        if (!value || Object.keys(value).length === 0) return "";

        // Get all selected IDs (where value is true)
        const selectedIds = Object.keys(value).filter(
            (key) => value[key] === true
        );

        return selectedIds.join(",");
    },
});

export function getPinnedColumnStyles<T>(column: Column<T>): CSSProperties {
    const isPinned = column.getIsPinned();

    return {
        left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
        right:
            isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
        position: isPinned ? "sticky" : "relative",
        width: column.getSize(),
        zIndex: isPinned ? 1 : 0,
    };
}

export function ShadowSeperator() {
    return (
        <div
            // https://stackoverflow.com/questions/5115427/how-can-i-add-a-box-shadow-on-one-side-of-an-element
            style={{ clipPath: "inset(0 -15px 0 0)" }}
            className="absolute inset-0 -z-10 shadow-sm pointer-events-none"
        />
    );
}
