<?php

namespace App;

enum SyncType: string
{
    case AD_ACCOUNTS = 'ad_accounts';
    case AD_CAMPAIGNS = 'ad_campaigns';
    case AD_SETS = 'ad_sets';
    case ADS = 'ads';
    case AD_CREATIVES = 'ad_creatives';
}
