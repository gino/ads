<?php

namespace App\Http\Integrations\Requests;

use App\Models\AdAccount;
use Illuminate\Support\Facades\Cache;
use Saloon\CachePlugin\Contracts\Cacheable;
use Saloon\CachePlugin\Contracts\Driver;
use Saloon\CachePlugin\Drivers\LaravelCacheDriver;
use Saloon\CachePlugin\Traits\HasCaching;
use Saloon\Enums\Method;
use Saloon\Http\Request;
use Saloon\PaginationPlugin\Contracts\Paginatable;

// https://github.com/gino/ads/blob/main/app/Jobs/Meta/SyncAdCampaigns.php

class GetInsightsRequest extends Request implements Cacheable, Paginatable
{
    use HasCaching;

    protected Method $method = Method::GET;

    protected AdAccount $adAccount;

    protected string $level;

    public function __construct(AdAccount $adAccount, string $level)
    {
        $this->adAccount = $adAccount;
        $this->level = $level;
    }

    public function resolveEndpoint(): string
    {
        return "{$this->adAccount->external_id}/insights";
    }

    protected function defaultQuery(): array
    {
        // https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group/insights#fields

        $fields = [
            'campaign_id',
            'adset_id',
            'ad_id',
            //
            'cpm',
            'cost_per_inline_link_click',
        ];

        return [
            'level' => $this->level,
            'fields' => implode(',', $fields),
            'date_preset' => 'maximum',
        ];
    }

    public function resolveCacheDriver(): Driver
    {
        return new LaravelCacheDriver(Cache::store('redis'));
    }

    public function cacheExpiryInSeconds(): int
    {
        return 30;
    }
}
