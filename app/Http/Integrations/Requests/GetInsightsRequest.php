<?php

namespace App\Http\Integrations\Requests;

use App\Http\Integrations\Requests\Traits\FilteringByDate;
use App\Http\Integrations\Requests\Traits\HasRateLimits;
use App\Models\AdAccount;
use Illuminate\Support\Facades\Cache;
use Saloon\CachePlugin\Contracts\Cacheable;
use Saloon\CachePlugin\Contracts\Driver;
use Saloon\CachePlugin\Drivers\LaravelCacheDriver;
use Saloon\CachePlugin\Traits\HasCaching;
use Saloon\Enums\Method;
use Saloon\Http\PendingRequest;
use Saloon\Http\Request;
use Saloon\PaginationPlugin\Contracts\Paginatable;

// https://github.com/gino/ads/blob/main/app/Jobs/Meta/SyncAdCampaigns.php

class GetInsightsRequest extends Request implements Cacheable, Paginatable
{
    use FilteringByDate, HasCaching, HasRateLimits;

    protected Method $method = Method::GET;

    protected AdAccount $adAccount;

    protected string $level;

    public function __construct(AdAccount $adAccount, string $level,
        string|array|null $dateFrom,
        string|array|null $dateTo
    ) {
        $this->adAccount = $adAccount;
        $this->level = $level;
        $this->setDateRange($dateFrom, $dateTo);
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
            'inline_link_clicks',
            'impressions',
            'actions',
            'cost_per_objective_result',
            'purchase_roas',
        ];

        return [
            'level' => $this->level,
            'fields' => implode(',', $fields),
            'time_range' => [
                'since' => $this->getFormattedDateFrom(),
                'until' => $this->getFormattedDateTo(),
            ],
        ];
    }

    public function resolveCacheDriver(): Driver
    {
        return new LaravelCacheDriver(Cache::store('redis'));
    }

    protected function cacheKey(PendingRequest $pendingRequest): ?string
    {
        $query = $pendingRequest->query()->all();

        if (! array_key_exists('limit', $query)) {
            $query['limit'] = 25;
        }

        $query['ad_account_id'] = $this->adAccount->id;

        return http_build_query($query);
    }

    public function cacheExpiryInSeconds(): int
    {
        // 15 minutes
        // Insights refresh every 15 minutes anyways, by Meta (limitations of the API)
        return 60 * 15;
    }

    protected function getLimiterPrefix(): ?string
    {
        return "ad-account-id-{$this->adAccount->id}";
    }
}
