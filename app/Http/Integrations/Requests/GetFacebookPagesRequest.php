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

class GetFacebookPagesRequest extends Request implements Cacheable, Paginatable
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

    public function cacheExpiryInSeconds(): int
    {
        // 5 minutes
        return 60 * 5;
    }
}
