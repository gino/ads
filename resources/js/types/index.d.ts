// https://github.com/laravel/react-starter-kit/blob/main/resources/js/types/index.d.ts

export interface Auth {
    user: App.Data.UserData;
}

export interface SharedData {
    auth: Auth;
    adAccounts: App.Data.AdAccountData[];
    selectedAdAccountId: string;
    ziggy: Config & { location: string };
    [key: string]: unknown;
}
