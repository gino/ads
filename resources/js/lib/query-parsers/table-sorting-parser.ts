import { SortingState } from "@tanstack/react-table";
import { createParser } from "nuqs";

// Custom nuqs parser to handle table sorting state in URL as query param (https://nuqs.47ng.com)
export const parseAsTableSorting = createParser<SortingState>({
    parse(queryValue) {
        if (!queryValue) return [];

        try {
            // Split by comma to get individual sort entries
            const sortEntries = queryValue
                .split(",")
                .filter((entry) => entry.trim() !== "");

            // Convert each entry to { id: string, desc: boolean } format
            return sortEntries.map((entry) => {
                const trimmed = entry.trim();

                // Check if entry ends with ":desc" for descending sort
                if (trimmed.endsWith(":desc")) {
                    return {
                        id: trimmed.slice(0, -5), // Remove ":desc" suffix
                        desc: true,
                    };
                }

                // Default to ascending sort
                return {
                    id: trimmed,
                    desc: false,
                };
            });
        } catch {
            return [];
        }
    },

    serialize(value) {
        if (!value || value.length === 0) return "";

        // Convert each sort entry to string format
        return value
            .map((sort) => {
                // Add ":desc" suffix for descending sorts
                return sort.desc ? `${sort.id}:desc` : sort.id;
            })
            .join(",");
    },
});
