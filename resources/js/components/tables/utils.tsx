import { Column } from "@tanstack/react-table";
import { isSameDay } from "date-fns";
import { CSSProperties, useMemo } from "react";
import { DateRange } from "react-day-picker";

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

export function isRangeEqual(a: DateRange | undefined, b: DateRange) {
    if (!a?.from || !a?.to || !b?.from || !b?.to) return false;
    return isSameDay(a.from, b.from) && isSameDay(a.to, b.to);
}
