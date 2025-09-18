import { Layout } from "@/components/layouts/app-layout";
import { UploadProvider } from "@/components/upload/upload-context";
import { UploadForm } from "@/components/upload/upload-form";
import { UploadedCreatives } from "@/components/upload/uploaded-creatives";
import useDeferred from "@/lib/hooks/use-deferred";

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
};

export type AdSetGroup = {
    id: string;
    label: string;
    creatives: string[];
};

export type UploadForm = {
    campaignId: string;
    adSetId: string;
    pixelId: string;
    websiteUrl: string;
    creatives: UploadedCreative[];
};

interface Props {
    campaigns: App.Data.AdCampaignData[];
    adSets: App.Data.AdSetData[];
    pixels: App.Data.PixelData[];
}

export default function Upload({ campaigns, adSets, pixels }: Props) {
    const { isLoading: isLoadingCampaigns } = useDeferred({
        data: "campaigns",
    });
    const { isLoading: isLoadingAdSets } = useDeferred({
        data: "adSets",
    });
    const { isLoading: isLoadingPixels } = useDeferred({
        data: "pixels",
    });

    return (
        <Layout title="Upload">
            <UploadProvider>
                <div className="grid grid-cols-2 h-full gap-2.5">
                    <UploadForm
                        campaigns={campaigns}
                        adSets={adSets}
                        pixels={pixels}
                        isLoadingCampaigns={isLoadingCampaigns}
                        isLoadingAdSets={isLoadingAdSets}
                        isLoadingPixels={isLoadingPixels}
                    />

                    <UploadedCreatives />
                </div>
            </UploadProvider>
        </Layout>
    );
}
