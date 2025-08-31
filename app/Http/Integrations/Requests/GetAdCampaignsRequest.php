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

class GetAdCampaignsRequest extends Request implements Cacheable, Paginatable
{
    use FilteringByDate, HasCaching;

    protected Method $method = Method::GET;

    protected AdAccount $adAccount;

    public function __construct(
        AdAccount $adAccount,
        string|array|null $dateFrom,
        string|array|null $dateTo
    ) {
        $this->adAccount = $adAccount;
        $this->setDateRange($dateFrom, $dateTo);
    }

    public function resolveEndpoint(): string
    {
        return "{$this->adAccount->external_id}/campaigns";
    }

    protected function defaultQuery(): array
    {
        // https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group

        $fields = [
            'id',
            'name',
            'effective_status',
            'daily_budget',
        ];

        return [
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

    public function cacheExpiryInSeconds(): int
    {
        return 60;
    }
}
