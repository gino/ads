// https://github.com/laravel/react-starter-kit/blob/main/resources/js/types/index.d.ts

export interface Auth {
    user: App.Data.UserData;
}

export interface SharedData {
    auth: Auth;
    adAccounts: App.Data.AdAccountData[];
    selectedAdAccountId: string;
    last_synced: Record<string, any> | null;
    flash: Record<string, any> | null;
    ziggy: Config & { location: string };
    [key: string]: unknown;
}
