import { useSelectedAdAccount } from "./hooks/use-selected-ad-account";

// https://developers.facebook.com/docs/marketing-api/currencies/
const currencyLocaleMap = {
    DZD: "fr-DZ", // Algerian Dinar
    ARS: "es-AR", // Argentine Peso
    AUD: "en-AU", // Australian Dollar
    BHD: "ar-BH", // Bahraini Dinar
    BDT: "bn-BD", // Bangladeshi Taka
    BOB: "es-BO", // Bolivian Boliviano
    BGN: "bg-BG", // Bulgarian Lev
    BRL: "pt-BR", // Brazilian Real
    GBP: "en-GB", // British Pound
    CAD: "en-CA", // Canadian Dollar
    CLP: "es-CL", // Chilean Peso
    CNY: "zh-CN", // Chinese Yuan
    COP: "es-CO", // Colombian Peso
    CRC: "es-CR", // Costa Rican Colon
    HRK: "hr-HR", // Croatian Kuna
    CZK: "cs-CZ", // Czech Koruna
    DKK: "da-DK", // Danish Krone
    EGP: "ar-EG", // Egyptian Pound
    EUR: "nl-NL", // Euro
    GTQ: "es-GT", // Guatemalan Quetzal
    HNL: "es-HN", // Honduran Lempira
    HKD: "zh-HK", // Hong Kong Dollar
    HUF: "hu-HU", // Hungarian Forint
    ISK: "is-IS", // Iceland Krona
    INR: "hi-IN", // Indian Rupee
    IDR: "id-ID", // Indonesian Rupiah
    ILS: "he-IL", // Israeli New Shekel
    JPY: "ja-JP", // Japanese Yen
    JOD: "ar-JO", // Jordanian Dinar
    KES: "sw-KE", // Kenyan Shilling
    KRW: "ko-KR", // Korean Won
    LVL: "lv-LV", // Latvian Lats
    LTL: "lt-LT", // Lithuanian Litas
    MOP: "pt-MO", // Macau Patacas
    MYR: "ms-MY", // Malaysian Ringgit
    MXN: "es-MX", // Mexican Peso
    NZD: "en-NZ", // New Zealand Dollar
    NIO: "es-NI", // Nicaraguan Cordoba
    NGN: "en-NG", // Nigerian Naira
    NOK: "nb-NO", // Norwegian Krone
    PKR: "ur-PK", // Pakistani Rupee
    PYG: "es-PY", // Paraguayan Guarani
    PEN: "es-PE", // Peruvian Nuevo Sol
    PHP: "en-PH", // Philippine Peso
    PLN: "pl-PL", // Polish Zloty
    QAR: "ar-QA", // Qatari Rials
    RON: "ro-RO", // Romanian Leu
    RUB: "ru-RU", // Russian Ruble
    SAR: "ar-SA", // Saudi Arabian Riyal
    RSD: "sr-RS", // Serbian Dinar
    SGD: "en-SG", // Singapore Dollar
    SKK: "sk-SK", // Slovak Koruna
    ZAR: "en-ZA", // South African Rand
    SEK: "sv-SE", // Swedish Krona
    CHF: "de-CH", // Swiss Franc
    TWD: "zh-TW", // Taiwan Dollar
    THB: "th-TH", // Thai Baht
    TRY: "tr-TR", // Turkish Lira
    AED: "ar-AE", // UAE Dirham
    UAH: "uk-UA", // Ukrainian Hryvnia
    USD: "en-US", // US Dollars
    UYU: "es-UY", // Uruguay Peso
    VEF: "es-VE", // Venezuelan Bolivar
    VND: "vi-VN", // Vietnamese Dong
    FBZ: "en-US", // credits (arbitrary default)
    VES: "es-VE", // Bolivar Soberano
};

export function formatMoney(amount: number) {
    const { selectedAdAccount } = useSelectedAdAccount();
    const currency = selectedAdAccount.currency;

    // @ts-ignore
    const locale = currencyLocaleMap[currency];

    return Intl.NumberFormat(locale, {
        style: "currency",
        currency: selectedAdAccount.currency,
    }).format(amount);
}

export function formatPercentage(value: number) {
    const { selectedAdAccount } = useSelectedAdAccount();
    const currency = selectedAdAccount.currency;

    // @ts-ignore
    const locale = currencyLocaleMap[currency];

    return Intl.NumberFormat(locale, {
        style: "percent",
        minimumFractionDigits: 2,
    }).format(value / 100);
}
