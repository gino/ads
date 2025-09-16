import { UploadForm, UploadForm as UploadFormType } from "@/pages/upload";
import { InertiaFormProps, useForm } from "@inertiajs/react";
import { createContext, PropsWithChildren, useContext, useMemo } from "react";

interface UploadContextType {
    form: InertiaFormProps<UploadFormType>;
    deleteCreative: (creativeId: string) => void;
}

const UploadContext = createContext<UploadContextType>(null!);

export function UploadProvider({ children }: PropsWithChildren) {
    const form = useForm<UploadForm>({
        campaignId: "",
        adSetId: "",
        pixelId: "",
        websiteUrl: "",
        creatives: [],
    });

    const memoizedValue = useMemo<UploadContextType>(
        () => ({
            form,
            deleteCreative: (creativeId) => {
                form.setData(
                    "creatives",
                    form.data.creatives.filter(
                        (creative) => creative.id !== creativeId
                    )
                );
            },
        }),
        [form]
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
