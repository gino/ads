// https://github.com/laravel/react-starter-kit/blob/main/resources/js/types/index.d.ts

export interface Auth {
    user: App.Data.UserData;
}

export interface SharedData {
    auth: Auth;
    adAccounts: App.Data.AdAccountData[];
    selectedAdAccountId: string;
    flash: Record<string, any> | null;
    ziggy: Config & { location: string; route: string };
    [key: string]: unknown;
}
