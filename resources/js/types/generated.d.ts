declare namespace App.Data {
export type AdAccountData = {
id: string;
name: string;
currency: string;
status: string;
externalId: string;
businessId: string | null;
};
export type AdCampaignData = {
id: string;
name: string;
effectiveStatus: string;
status: string;
dailyBudget: string | null;
insights: App.Data.InsightsData | null;
};
export type AdData = {
id: string;
name: string;
effectiveStatus: string;
status: string;
adsetId: string;
campaignId: string;
insights: App.Data.InsightsData | null;
};
export type AdSetData = {
id: string;
name: string;
effectiveStatus: string;
status: string;
campaignId: string;
insights: App.Data.InsightsData | null;
};
export type FacebookPageData = {
id: string;
name: string;
businessId: string | null;
picture: string | null;
instagramAccount: App.Data.InstagramAccountData | null;
};
export type InsightsData = {
campaignId: string | null;
adsetId: string | null;
adId: string | null;
spend: number | null;
cpm: number | null;
cpc: number | null;
ctr: number | null;
clicks: number | null;
impressions: number | null;
conversions: number | null;
atc: number | null;
cpa: number | null;
roas: number | null;
};
export type InstagramAccountData = {
id: string;
username: string;
hasProfilePicture: boolean;
picture: string;
};
export type PixelData = {
id: string;
name: string;
isUnavailable: boolean;
lastFiredTime: string;
};
export type TargetingCountryData = {
countryCode: string;
name: string;
};
export type UserData = {
id: string;
name: string;
email: string;
avatar: string;
};
}
