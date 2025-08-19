import { Column, RowSelectionState } from "@tanstack/react-table";
import { isSameDay } from "date-fns";
import { createParser } from "nuqs";
import { CSSProperties, useMemo } from "react";

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
            className="absolute inset-0 -z-10 shadow pointer-events-none"
        />
    );
}

interface SkeletonLoaderProps<T, C> {
    data: T[];
    columns: C[];
    isLoading?: boolean;
    skeletonCount?: number;
}

interface SkeletonLoaderReturn<T, C> {
    data: T[];
    columns: C[];
}

export const useSkeletonLoader = <T, C>({
    data,
    columns,
    isLoading,
    skeletonCount = 10,
}: SkeletonLoaderProps<T, C>): SkeletonLoaderReturn<T, C> => {
    const skeletonData = useMemo(() => {
        if (isLoading) {
            return Array(skeletonCount).fill({}) as T[];
        }
        return data || [];
    }, [isLoading, data, skeletonCount]);

    const skeletonColumns = useMemo(() => {
        if (isLoading) {
            return columns.map((column) => ({
                ...column,
                header: (
                    <div className="h-4 min-w-32 rounded w-full bg-gray-100 animate-pulse" />
                ),
                cell: (
                    <div className="h-4 min-w-32 rounded w-full bg-gray-100 animate-pulse" />
                ),
                footer: (
                    <div className="h-4 min-w-32 rounded w-full bg-gray-100 animate-pulse" />
                ),
            }));
        }
        return columns;
    }, [isLoading, columns]);

    return {
        data: skeletonData,
        columns: skeletonColumns,
    };
};

export function isRangeEqual(
    a: { from?: Date; to?: Date } | null,
    b: { from: Date; to: Date }
) {
    if (!a?.from || !a?.to) return false;
    return isSameDay(a.from, b.from) && isSameDay(a.to, b.to);
}
