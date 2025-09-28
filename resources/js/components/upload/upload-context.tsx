import { UploadForm, UploadForm as UploadFormType } from "@/pages/upload";
import { InertiaFormProps, useForm } from "@inertiajs/react";
import {
    createContext,
    PropsWithChildren,
    useCallback,
    useContext,
    useMemo,
} from "react";

interface UploadContextType {
    form: InertiaFormProps<UploadFormType>;
    deleteCreative: (creativeId: string) => void;
    setCreativeLabel: (creativeId: string, label: string) => void;
}

const UploadContext = createContext<UploadContextType>(null!);
UploadContext.displayName = "UploadContext";

export function UploadProvider({ children }: PropsWithChildren) {
    const form = useForm<UploadForm>({
        campaignId: "",
        adSetId: "",
        pixelId: "",
        websiteUrl: "",
        creatives: [],
        facebookPageId: "",
        instagramPageId: "",
        settings: {
            paused_by_default: true,
            disable_enhancements: true,
            disable_promo_codes: true,
        },
    });

    const deleteCreative = useCallback(
        (creativeId: string) => {
            form.setData(
                "creatives",
                form.data.creatives.filter(
                    (creative) => creative.id !== creativeId
                )
            );
        },
        [form]
    );

    const setCreativeLabel = useCallback(
        (creativeId: string, label: string) => {
            form.setData(
                "creatives",
                form.data.creatives.map((creative) =>
                    creative.id === creativeId
                        ? { ...creative, label }
                        : creative
                )
            );
        },
        [form]
    );

    const memoizedValue = useMemo<UploadContextType>(
        () => ({
            form,
            deleteCreative,
            setCreativeLabel,
        }),
        [form, deleteCreative, setCreativeLabel]
    );

    return (
        <UploadContext.Provider value={memoizedValue}>
            {children}
        </UploadContext.Provider>
    );
}

export function useUploadContext() {
    return useContext(UploadContext);
}
