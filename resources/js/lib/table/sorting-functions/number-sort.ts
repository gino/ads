import { Row } from "@tanstack/react-table";

export function numberSorting<
    TData extends { insights: App.Data.InsightsData | null }
>(rowA: Row<TData>, rowB: Row<TData>, columnId: string) {
    const getValue = (row: Row<TData>) => {
        const value = row.original.insights?.[
            columnId as keyof App.Data.InsightsData
        ] as number | null | undefined;
        return value == null || isNaN(value) ? -Infinity : value;
    };

    return getValue(rowB) - getValue(rowA);
}
