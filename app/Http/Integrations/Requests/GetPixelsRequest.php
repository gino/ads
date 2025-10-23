<?php

namespace App\Http\Integrations\Requests;

use App\Http\Integrations\Requests\Traits\HasRateLimits;
use App\Models\AdAccount;
use Illuminate\Support\Facades\Cache;
use ReflectionClass;
use Saloon\CachePlugin\Contracts\Cacheable;
use Saloon\CachePlugin\Contracts\Driver;
use Saloon\CachePlugin\Drivers\LaravelCacheDriver;
use Saloon\CachePlugin\Traits\HasCaching;
use Saloon\Enums\Method;
use Saloon\Http\PendingRequest;
use Saloon\Http\Request;
use Saloon\PaginationPlugin\Contracts\Paginatable;

class GetPixelsRequest extends Request implements Cacheable, Paginatable
{
    use HasCaching, HasRateLimits;

    protected Method $method = Method::GET;

    protected AdAccount $adAccount;

    public function __construct(AdAccount $adAccount)
    {
        $this->adAccount = $adAccount;
    }

    public function resolveEndpoint(): string
    {
        return "{$this->adAccount->external_id}/adspixels";
    }

    protected function defaultQuery(): array
    {
        // https://developers.facebook.com/docs/marketing-api/reference/ad-account/adspixels/
        // https://developers.facebook.com/docs/marketing-api/reference/ads-pixel/#fields

        $fields = [
            'id',
            'name',
            'is_unavailable',
            'last_fired_time',
        ];

        return [
            'fields' => implode(',', $fields),
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
        return 60 * 15;
    }

    protected function getLimiterPrefix(): ?string
    {
        $requestName = (new ReflectionClass($this))->getShortName();

        return "ad-account-id-{$this->adAccount->id}:{$requestName}";
    }
}
