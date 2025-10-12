import { SortingFn } from "@tanstack/react-table";
import { numberSorting } from "./number-sort";

declare module "@tanstack/react-table" {
    interface SortingFns {
        numberSorting: SortingFn<unknown>;
    }
}

export function getSortingFunctions() {
    return {
        numberSorting,
    };
}
