import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { CommandMenuPage } from "./command-menu";

// https://github.com/pmndrs/zustand

interface CommandMenuStore {
    isOpen: boolean;
    setIsOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
    pages: CommandMenuPage[];
    setPage: (page: CommandMenuPage) => void;
    resetPage: () => void;
    search: string;
    setSearch: (value: string) => void;
    placeholder: string;
    setPlaceholder: (value: string) => void;
}

const initialPlaceholder = "Type a command or search...";

export const useCommandMenuStore = create<CommandMenuStore>((set) => ({
    isOpen: false,
    setIsOpen: (value) => {
        return set((state) => ({
            isOpen: typeof value === "function" ? value(state.isOpen) : value,
        }));
    },
    pages: [],
    setPage: (page) => {
        return set((state) => ({ pages: [...state.pages, page], search: "" }));
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
            pages: state.pages,
            setPage: state.setPage,
            search: state.search,
            setSearch: state.setSearch,
            placeholder: state.placeholder,
            setPlaceholder: state.setPlaceholder,
            resetPage: state.resetPage,
        }))
    );
}
