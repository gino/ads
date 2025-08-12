import { Column } from "@tanstack/react-table";
import { CSSProperties } from "react";

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
