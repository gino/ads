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
status: string;
adsetId: string;
campaignId: string;
insights: App.Data.InsightsData | null;
};
export type AdSetData = {
id: string;
name: string;
status: string;
campaignId: string;
insights: App.Data.InsightsData | null;
};
export type InsightsData = {
campaignId: string;
adsetId: string;
adId: string;
spend: number;
cpm: number;
cpc: number;
ctr: number;
};
export type UserData = {
id: string;
name: string;
email: string;
avatar: string;
};
}
