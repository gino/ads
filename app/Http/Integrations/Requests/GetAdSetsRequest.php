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

// https://github.com/gino/ads/blob/main/app/Jobs/Meta/SyncAdSets.php

class GetAdSetsRequest extends Request implements Cacheable, Paginatable
{
    use HasCaching;

    protected Method $method = Method::GET;

    protected AdAccount $adAccount;

    public function __construct(AdAccount $adAccount)
    {
        $this->adAccount = $adAccount;
    }

    public function resolveEndpoint(): string
    {
        return "{$this->adAccount->external_id}/adsets";
    }

    protected function defaultQuery(): array
    {
        // https://developers.facebook.com/docs/marketing-api/reference/ad-campaign#fields

        $fields = [
            'id',
            'name',
            'effective_status',
            'status',
            'campaign_id',
        ];

        return [
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
