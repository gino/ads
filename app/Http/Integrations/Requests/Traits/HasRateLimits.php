<?php

namespace App\Http\Integrations\Requests\Traits;

use App\Http\Integrations\Requests\Helpers\HandleTooManyAttempts;
use Illuminate\Support\Facades\Cache;
use Saloon\Http\Response;
use Saloon\RateLimitPlugin\Contracts\RateLimitStore;
use Saloon\RateLimitPlugin\Limit;
use Saloon\RateLimitPlugin\Stores\LaravelCacheStore;
use Saloon\RateLimitPlugin\Traits\HasRateLimits as HasRateLimitsPlugin;

trait HasRateLimits
{
    use HasRateLimitsPlugin;

    protected function resolveLimits(): array
    {
        return [];
    }

    protected function resolveRateLimitStore(): RateLimitStore
    {
        return new LaravelCacheStore(Cache::store('redis'));
    }

    protected function handleTooManyAttempts(Response $response, Limit $limit): void
    {
        HandleTooManyAttempts::handle($response, $limit);
    }
}
