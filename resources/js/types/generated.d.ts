declare namespace App {
export type SyncType = 'ad_accounts' | 'ad_campaigns' | 'ad_sets' | 'ads' | 'ad_creatives';
}
declare namespace App.Data {
export type AdAccountData = {
id: string;
name: string;
currency: string;
status: string;
externalId: string;
};
export type UserData = {
id: string;
name: string;
email: string;
avatar: string;
};
}
