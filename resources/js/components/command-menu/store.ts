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
    setPage: (page: CommandMenuPage) => void;
    setPages: (
        value:
            | CommandMenuPage[]
            | ((prev: CommandMenuPage[]) => CommandMenuPage[])
    ) => void;
    resetPage: () => void;
    search: string;
    setSearch: (value: string) => void;
    placeholder: string;
    setPlaceholder: (value: string) => void;
}

export const initialPlaceholder = "Type a command or search...";

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
    setPage: (page) => {
        return set((state) => ({ pages: [...state.pages, page], search: "" }));
    },
    setPages: (value) => {
        return set((state) => ({
            pages: typeof value === "function" ? value(state.pages) : value,
        }));
    },
    search: "",
    setSearch: (value) => {
        return set(() => ({ search: value }));
    },
    placeholder: initialPlaceholder,
    setPlaceholder: (value) => {
        return set(() => ({ placeholder: value }));
    },
    resetPage: () => {
        return set(() => ({
            pages: [],
            search: "",
            placeholder: initialPlaceholder,
        }));
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
            placeholder: state.placeholder,
            setPlaceholder: state.setPlaceholder,
            resetPage: state.resetPage,
        }))
    );
}
