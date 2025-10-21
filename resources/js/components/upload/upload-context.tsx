import {
    CreativeSettings,
    UploadedCreative,
    UploadForm,
    UploadFormDefaults,
    UploadForm as UploadFormType,
} from "@/pages/upload";
import { InertiaFormProps, useForm, usePage } from "@inertiajs/react";
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
import { CallToActionType } from "../shared-inputs/call-to-action-input";

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
    defaultCreativeSettings: CreativeSettings;
}

const UploadContext = createContext<UploadContextType>(null!);
UploadContext.displayName = "UploadContext";

export function UploadProvider({ children }: PropsWithChildren) {
    const {
        props: { defaults },
    } = usePage<{ defaults: UploadFormDefaults }>();

    const defaultCreativeSettings: CreativeSettings = {
        cta: (defaults.cta as CallToActionType) ?? "SHOP_NOW",
        primaryTexts: defaults.primaryText ? [defaults.primaryText] : [],
        headlines: defaults.headline ? [defaults.headline] : [],
        descriptions: defaults.description ? [defaults.description] : [],
    };

    const form = useForm<UploadForm>({
        campaignId: "",
        adSetId: "",
        pixelId: defaults.pixelId ?? "",
        websiteUrl: defaults.websiteUrl ?? "",
        facebookPageId: defaults.facebookPageId ?? "",
        instagramPageId: defaults.instagramPageId ?? "",
        settings: {
            pausedByDefault: defaults.pausedByDefault ?? false,
            disableEnhancements: defaults.disableEnhancements ?? true,
            disableMultiAds: defaults.disableMultiAds ?? true,
        },
        utmParameters:
            defaults.utmParameters ??
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
            defaultCreativeSettings,
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
            defaultCreativeSettings,
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
