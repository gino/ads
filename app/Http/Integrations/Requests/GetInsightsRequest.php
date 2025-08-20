<?php

namespace App\Http\Integrations\Requests;

use App\Models\AdAccount;
use Carbon\Carbon;
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

    protected string|array|null $dateFrom;

    protected string|array|null $dateTo;

    public function __construct(AdAccount $adAccount, string $level,
        string|array|null $dateFrom,
        string|array|null $dateTo
    ) {
        $this->adAccount = $adAccount;
        $this->level = $level;
        $this->dateFrom = $dateFrom;
        $this->dateTo = $dateTo;
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
            'spend',
            'cpm',
            'cost_per_inline_link_click',
            'inline_link_click_ctr',
            'actions',
            'cost_per_objective_result',
            'purchase_roas',
        ];

        $today = now()->format('Y-m-d');
        $dateFrom = Carbon::parse($this->dateFrom ?? $today)->format('Y-m-d');
        $dateTo = Carbon::parse($this->dateTo ?? $today)->format('Y-m-d');

        return [
            'level' => $this->level,
            'fields' => implode(',', $fields),
            // 'date_preset' => 'maximum',
            'time_range' => [
                'since' => $dateFrom,
                'until' => $dateTo,
            ],
        ];
    }

    public function resolveCacheDriver(): Driver
    {
        return new LaravelCacheDriver(Cache::store('redis'));
    }

    public function cacheExpiryInSeconds(): int
    {
        // 15 minutes
        // Insights refresh every 15 minutes anyways, by Meta
        return 900;
    }
}
