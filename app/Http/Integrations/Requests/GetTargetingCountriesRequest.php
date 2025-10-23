<?php

namespace App\Http\Integrations\Requests;

use App\Http\Integrations\Requests\Traits\HasRateLimits;
use App\Models\Connection;
use Illuminate\Support\Facades\Cache;
use ReflectionClass;
use Saloon\CachePlugin\Contracts\Cacheable;
use Saloon\CachePlugin\Contracts\Driver;
use Saloon\CachePlugin\Drivers\LaravelCacheDriver;
use Saloon\CachePlugin\Traits\HasCaching;
use Saloon\Enums\Method;
use Saloon\Http\PendingRequest;
use Saloon\Http\Request;

class GetTargetingCountriesRequest extends Request implements Cacheable
{
    use HasCaching, HasRateLimits;

    protected Method $method = Method::GET;

    public function __construct(public Connection $connection) {}

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

    public function cacheExpiryInSeconds(): int
    {
        // 24 hours - no need to cache this for anything shorter
        return 60 * 60 * 24;
    }

    protected function cacheKey(PendingRequest $pendingRequest): ?string
    {
        $query = $pendingRequest->query()->all();

        if (! array_key_exists('limit', $query)) {
            $query['limit'] = 25;
        }

        $query['connection_id'] = $this->connection->id;

        return http_build_query($query);
    }

    protected function getLimiterPrefix(): ?string
    {
        $requestName = (new ReflectionClass($this))->getShortName();

        return "connection-id-{$this->connection->id}:{$requestName}";
    }
}
