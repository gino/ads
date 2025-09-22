<?php

namespace App\Http\Integrations\Requests;

use Illuminate\Support\Facades\Cache;
use Saloon\CachePlugin\Contracts\Cacheable;
use Saloon\CachePlugin\Contracts\Driver;
use Saloon\CachePlugin\Drivers\LaravelCacheDriver;
use Saloon\CachePlugin\Traits\HasCaching;
use Saloon\Enums\Method;
use Saloon\Http\Request;

class GetTargetingCountries extends Request implements Cacheable
{
    use HasCaching;

    protected Method $method = Method::GET;

    public function resolveEndpoint(): string
    {
        return '/search';
    }

    protected function defaultQuery(): array
    {
        return [
            'location_types' => ['country'],
            'type' => 'adgeolocation',
            'q' => '',
            'limit' => 1000,
        ];
    }

    public function resolveCacheDriver(): Driver
    {
        return new LaravelCacheDriver(Cache::store('redis'));
    }

    protected function cacheKey(): ?string
    {
        return 'targeting-countries';
    }

    public function cacheExpiryInSeconds(): int
    {
        // 60 minutes
        return 60 * 60;
    }
}
