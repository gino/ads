declare namespace App.Data {
export type AdAccountData = {
id: string;
name: string;
currency: string;
status: string;
externalId: string;
};
export type AdCampaignData = {
id: string;
name: string;
status: string;
dailyBudget: string;
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
export type UserData = {
id: string;
name: string;
email: string;
avatar: string;
};
}
