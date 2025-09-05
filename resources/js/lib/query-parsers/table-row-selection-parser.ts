import { RowSelectionState } from "@tanstack/react-table";
import { createParser } from "nuqs";

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
