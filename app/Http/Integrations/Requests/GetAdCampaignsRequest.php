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

class GetAdCampaignsRequest extends Request implements Cacheable, Paginatable
{
    use HasCaching;

    protected Method $method = Method::GET;

    protected AdAccount $adAccount;

    protected Carbon $dateFrom;

    protected Carbon $dateTo;

    public function __construct(AdAccount $adAccount, Carbon $dateFrom, Carbon $dateTo)
    {
        $this->adAccount = $adAccount;
        $this->dateFrom = $dateFrom;
        $this->dateTo = $dateTo;
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

        // dd($this->dateFrom->format('Y-m-d'));
        // dd($this->dateFrom->format('Y-m-d'));

        return [
            'fields' => implode(',', $fields),
            'date_preset' => 'maximum',
            // {'since':YYYY-MM-DD,'until':YYYY-MM-DD}
            // 'time_range' => [
            //     'since' => '',
            //     'until' => ''
            // ]
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
