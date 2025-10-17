import { Layout } from "@/components/layouts/app-layout";
import {
    AdCreativeSettingsPopup,
    CallToActionType,
} from "@/components/upload/popups/ad-creative-settings";
import { UploadProvider } from "@/components/upload/upload-context";
import { UploadForm } from "@/components/upload/upload-form";
import { UploadedCreatives } from "@/components/upload/uploaded-creatives";
import useDeferred from "@/lib/hooks/use-deferred";
import { useSelectedAdAccount } from "@/lib/hooks/use-selected-ad-account";

export type CreativeSettings = {
    cta: CallToActionType;
    primaryTexts: string[];
    headlines: string[];
    descriptions: string[];
};

export type UploadedCreative = {
    id: string;
    name: string;
    label?: string | null;
    extension: string;
    size: string;
    file: File;
    preview: string;
    type: string;
    thumbnail: string | null;
    settings: CreativeSettings;
};

export type AdSetGroupSettings = {
    locations: string[];
    age: [number, number];
    gender: "all" | "men" | "women";
    startDate: Date | null;
};

export type AdSetGroup = {
    id: string;
    label: string;
    creatives: string[];
    settings: AdSetGroupSettings;
};

export type UploadForm = {
    campaignId: string;
    adSetId: string;
    pixelId: string;
    websiteUrl: string;
    facebookPageId: string;
    instagramPageId: string;
    settings: {
        pausedByDefault: boolean;
        disableEnhancements: boolean;
        disableMultiAds: boolean;
    };
};

interface Props {
    campaigns: App.Data.AdCampaignData[];
    adSets: App.Data.AdSetData[];
    pixels: App.Data.PixelData[];
    pages: App.Data.FacebookPageData[];
}

export default function Upload({ campaigns, adSets, pixels, pages }: Props) {
    const { isLoading: isLoadingCampaigns } = useDeferred({
        data: "campaigns",
    });
    const { isLoading: isLoadingAdSets } = useDeferred({
        data: "adSets",
    });
    const { isLoading: isLoadingPixels } = useDeferred({
        data: "pixels",
    });
    const { isLoading: isLoadingPages } = useDeferred({
        data: "pages",
    });

    const { selectedAdAccountId } = useSelectedAdAccount();

    return (
        <Layout title="Upload">
            {/* We're resetting the full component state since a lot of data depend on this selected ad account - easiest and best way */}
            <UploadProvider key={selectedAdAccountId}>
                <div className="grid grid-cols-2 h-full gap-3">
                    <UploadForm
                        campaigns={campaigns}
                        adSets={adSets}
                        pixels={pixels}
                        pages={pages}
                        //
                        isLoadingCampaigns={isLoadingCampaigns}
                        isLoadingAdSets={isLoadingAdSets}
                        isLoadingPixels={isLoadingPixels}
                        isLoadingPages={isLoadingPages}
                    />

                    <UploadedCreatives adSets={adSets} />
                </div>

                <AdCreativeSettingsPopup />
            </UploadProvider>
        </Layout>
    );
}
