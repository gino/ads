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
insights: App.Data.InsightsData;
};
export type AdData = {
id: string;
name: string;
status: string;
adsetId: string;
campaignId: string;
};
export type AdSetData = {
id: string;
name: string;
status: string;
campaignId: string;
};
export type InsightsData = {
campaignId?: string;
adsetId?: string;
adId?: string;
cpm?: number;
cpc?: number;
};
export type UserData = {
id: string;
name: string;
email: string;
avatar: string;
};
}
