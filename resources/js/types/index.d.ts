// https://github.com/laravel/react-starter-kit/blob/main/resources/js/types/index.d.ts

export interface Auth {
    user: {
        // TODO: make generated type
        id: string;
    };
}

export interface SharedData {
    auth: Auth;
    ziggy: Config & { location: string };
    [key: string]: unknown;
}
