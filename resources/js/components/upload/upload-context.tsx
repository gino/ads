import {
    CreativeSettings,
    UploadForm,
    UploadForm as UploadFormType,
} from "@/pages/upload";
import { InertiaFormProps, useForm } from "@inertiajs/react";
import {
    createContext,
    Dispatch,
    PropsWithChildren,
    SetStateAction,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

interface UploadContextType {
    form: InertiaFormProps<UploadFormType>;
    deleteCreative: (creativeId: string) => void;
    setCreativeLabel: (creativeId: string, label: string) => void;
    //
    popupCreativeId: string | null;
    setPopupCreativeId: Dispatch<SetStateAction<string | null>>;
    //
    updateCreativeSetting: <T extends keyof CreativeSettings>(
        creativeId: string,
        key: T,
        value: CreativeSettings[T]
    ) => void;
    getCreativeSettings: (creativeId: string) => CreativeSettings;
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

    const [popupCreativeId, setPopupCreativeId] = useState<string | null>(null);

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

    const getCreativeSettings = useCallback(
        (creativeId: string): CreativeSettings => {
            const creative = form.data.creatives.find(
                (c) => c.id === creativeId
            )!;

            return creative.settings;
        },
        [form.data.creatives]
    );

    const updateCreativeSetting = useCallback(
        <T extends keyof CreativeSettings>(
            creativeId: string,
            key: T,
            value: CreativeSettings[T]
        ) => {
            form.setData({
                ...form.data,
                creatives: form.data.creatives.map((creative) =>
                    creative.id === creativeId
                        ? {
                              ...creative,
                              settings: {
                                  ...creative.settings,
                                  [key]: value,
                              },
                          }
                        : creative
                ),
            });
        },
        [form]
    );

    const memoizedValue = useMemo<UploadContextType>(
        () => ({
            form,
            deleteCreative,
            setCreativeLabel,
            popupCreativeId,
            setPopupCreativeId,
            getCreativeSettings,
            updateCreativeSetting,
        }),
        [
            form,
            deleteCreative,
            setCreativeLabel,
            popupCreativeId,
            setPopupCreativeId,
            getCreativeSettings,
            updateCreativeSetting,
        ]
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
