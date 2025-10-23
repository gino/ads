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
use Saloon\PaginationPlugin\Contracts\Paginatable;

class GetFacebookPagesRequest extends Request implements Cacheable, Paginatable
{
    use HasCaching, HasRateLimits;

    protected Method $method = Method::GET;

    public function __construct(public Connection $connection) {}

    public function resolveEndpoint(): string
    {
        return '/me/accounts';
    }

    protected function defaultQuery(): array
    {
        // https://developers.facebook.com/docs/graph-api/reference/page/#fields
        // https://developers.facebook.com/docs/graph-api/reference/shadow-ig-user/
        $fields = [
            'id',
            'name',
            'business{id}',
            'picture',
            'connected_instagram_account{id,username,has_profile_pic,profile_picture_url}',
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

        $query['connection_id'] = $this->connection->id;

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

        return "connection-id-{$this->connection->id}:{$requestName}";
    }
}
