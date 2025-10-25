import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { CommandMenuPage } from "./command-menu";

// https://github.com/pmndrs/zustand

interface CommandMenuStore {
    isOpen: boolean;
    setIsOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
    isLoading: boolean;
    setIsLoading: (value: boolean) => void;
    pages: CommandMenuPage[];
    setPage: (page: CommandMenuPage, meta?: Record<string, any>) => void;
    setPages: (
        value:
            | CommandMenuPage[]
            | ((prev: CommandMenuPage[]) => CommandMenuPage[])
    ) => void;
    pageMeta: Record<string, any>;
    setPageMeta: (value: Record<string, any>) => void;
    resetPage: () => void;
    search: string;
    setSearch: (value: string) => void;
    selectedItemId: string | null;
    setSelectedItemId: (id: string) => void;
}

export const initialPlaceholder = "Type a command or search...";

const pagePlaceholders: Record<CommandMenuPage, string> = {
    "ad-accounts": "Search ad accounts...",
    settings: "Search settings...",
    campaigns: "Search campaigns...",
    adsets: "Search ad sets...",
    ads: "Search ads...",
};

export function getPlaceholder(pages: CommandMenuPage[]): string {
    if (pages.length === 0) {
        return initialPlaceholder;
    }
    const currentPage = pages[pages.length - 1];
    return pagePlaceholders[currentPage] || initialPlaceholder;
}

export const useCommandMenuStore = create<CommandMenuStore>((set, get) => ({
    isOpen: false,
    setIsOpen: (value) => {
        set((state) => {
            const next =
                typeof value === "function" ? value(state.isOpen) : value;

            if (!next) {
                // if we're closing, reset the page
                get().resetPage();
            }

            return { isOpen: next };
        });
    },
    isLoading: false,
    setIsLoading: (value) => {
        return set(() => ({ isLoading: value }));
    },
    pages: [],
    setPage: (page, meta) => {
        return set((state) => ({
            pages: [...state.pages, page],
            search: "",
            selectedItemId: null,
            pageMeta: meta || {},
        }));
    },
    setPages: (value) => {
        return set((state) => ({
            pages: typeof value === "function" ? value(state.pages) : value,
            selectedItemId: null,
            pageMeta: {},
        }));
    },
    search: "",
    setSearch: (value) => {
        return set(() => ({ search: value }));
    },
    pageMeta: {},
    setPageMeta: (value) => {
        return set(() => ({ pageMeta: value }));
    },
    resetPage: () => {
        return set(() => ({
            pages: [],
            search: "",
            placeholder: initialPlaceholder,
            selectedItemId: null,
            pageMeta: {},
        }));
    },
    selectedItemId: "",
    setSelectedItemId: (value) => {
        return set(() => ({ selectedItemId: value }));
    },
}));

export function useCommandMenu() {
    return useCommandMenuStore(
        useShallow((state) => ({
            isOpen: state.isOpen,
            setIsOpen: state.setIsOpen,
            isLoading: state.isLoading,
            setIsLoading: state.setIsLoading,
            pages: state.pages,
            setPage: state.setPage,
            setPages: state.setPages,
            search: state.search,
            setSearch: state.setSearch,
            placeholder: getPlaceholder(state.pages),
            resetPage: state.resetPage,
            pageMeta: state.pageMeta,
            setPageMeta: state.setPageMeta,
            selectedItemId: state.selectedItemId,
            setSelectedItemId: state.setSelectedItemId,
        }))
    );
}
