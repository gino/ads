import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { CommandMenuPage } from "./command-menu";

// https://github.com/pmndrs/zustand

interface CommandMenuStore {
    isOpen: boolean;
    setIsOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
    page: CommandMenuPage;
    setPage: (page: CommandMenuPage) => void;
    search: string;
    setSearch: (value: string) => void;
}

export const useCommandMenuStore = create<CommandMenuStore>((set) => ({
    isOpen: false,
    setIsOpen: (value) => {
        return set((state) => ({
            isOpen: typeof value === "function" ? value(state.isOpen) : value,
        }));
    },
    page: "index",
    setPage: (page) => {
        return set(() => ({ page }));
    },
    search: "",
    setSearch: (value) => {
        return set(() => ({ search: value }));
    },
}));

export function useCommandMenu() {
    return useCommandMenuStore(
        useShallow((state) => ({
            isOpen: state.isOpen,
            setIsOpen: state.setIsOpen,
            page: state.page,
            setPage: state.setPage,
            search: state.search,
            setSearch: state.setSearch,
        }))
    );
}
