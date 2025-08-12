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
};
export type UserData = {
id: string;
name: string;
email: string;
avatar: string;
};
}
