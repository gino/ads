import {
    CreativeSettings,
    UploadedCreative,
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
    creatives: UploadedCreative[];
    setCreatives: Dispatch<SetStateAction<UploadedCreative[]>>;
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

export const defaultCreativeSettings: CreativeSettings = {
    cta: "SHOP_NOW",
    primaryTexts: [],
    headlines: [],
    descriptions: [],
};

export function UploadProvider({ children }: PropsWithChildren) {
    const form = useForm<UploadForm>({
        campaignId: "",
        adSetId: "",
        pixelId: "",
        websiteUrl: "",
        facebookPageId: "",
        instagramPageId: "",
        settings: {
            pausedByDefault: false,
            disableEnhancements: true,
            disableMultiAds: true,
        },
        utmParameters:
            "utm_campaign={{campaign.id}}&utm_ad_group={{adset.id}}&utm_ad={{ad.id}}&utm_source=meta",
    });

    const [creatives, setCreatives] = useState<UploadedCreative[]>([]);
    const [popupCreativeId, setPopupCreativeId] = useState<string | null>(null);

    const deleteCreative = useCallback(
        (creativeId: string) => {
            setCreatives((prev) =>
                prev.filter((creative) => creative.id !== creativeId)
            );
        },
        [form]
    );

    const setCreativeLabel = useCallback(
        (creativeId: string, label: string) => {
            setCreatives((prev) =>
                prev.map((creative) =>
                    creative.id === creativeId
                        ? { ...creative, label }
                        : creative
                )
            );
        },
        [form]
    );

    const updateCreativeSetting = useCallback(
        <T extends keyof CreativeSettings>(
            creativeId: string,
            key: T,
            value: CreativeSettings[T]
        ) => {
            setCreatives((prev) =>
                prev.map((creative) =>
                    creative.id === creativeId
                        ? {
                              ...creative,
                              settings: {
                                  ...creative.settings,
                                  [key]: value,
                              },
                          }
                        : creative
                )
            );
        },
        []
    );

    const getCreativeSettings = useCallback(
        (creativeId: string): CreativeSettings => {
            const creative = creatives.find((c) => c.id === creativeId);
            return creative?.settings ?? defaultCreativeSettings;
        },
        [creatives]
    );

    const memoizedValue = useMemo<UploadContextType>(
        () => ({
            form,
            creatives,
            setCreatives,
            deleteCreative,
            setCreativeLabel,
            popupCreativeId,
            setPopupCreativeId,
            getCreativeSettings,
            updateCreativeSetting,
        }),
        [
            form,
            creatives,
            setCreatives,
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
