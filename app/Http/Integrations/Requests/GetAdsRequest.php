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

// https://github.com/gino/ads/blob/main/app/Jobs/Meta/SyncAds.php

class GetAdsRequest extends Request implements Cacheable, Paginatable
{
    use HasCaching;

    protected Method $method = Method::GET;

    protected AdAccount $adAccount;

    protected string|array|null $dateFrom;

    protected string|array|null $dateTo;

    public function __construct(AdAccount $adAccount,
        string|array|null $dateFrom,
        string|array|null $dateTo
    ) {
        $this->adAccount = $adAccount;
        $this->dateFrom = $dateFrom;
        $this->dateTo = $dateTo;
    }

    public function resolveEndpoint(): string
    {
        return "{$this->adAccount->external_id}/ads";
    }

    protected function defaultQuery(): array
    {
        // https://developers.facebook.com/docs/marketing-api/reference/adgroup/#fields

        $fields = [
            'id',
            'name',
            'effective_status',
            'status',
            'adset_id',
            'campaign_id',
        ];

        $today = now()->format('Y-m-d');
        $dateFrom = Carbon::parse($this->dateFrom ?? $today)->format('Y-m-d');
        $dateTo = Carbon::parse($this->dateTo ?? $today)->format('Y-m-d');

        return [
            'fields' => implode(',', $fields),
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
        return 60;
    }
}
