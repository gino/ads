<?php

namespace App\Http\Integrations\Requests;

use App\Http\Integrations\Requests\Traits\HasRateLimits;
use App\Models\AdAccount;
use Illuminate\Support\Facades\Cache;
use Saloon\CachePlugin\Contracts\Cacheable;
use Saloon\CachePlugin\Contracts\Driver;
use Saloon\CachePlugin\Drivers\LaravelCacheDriver;
use Saloon\CachePlugin\Traits\HasCaching;
use Saloon\Enums\Method;
use Saloon\Http\PendingRequest;
use Saloon\Http\Request;
use Saloon\PaginationPlugin\Contracts\Paginatable;

// https://github.com/gino/ads/blob/main/app/Jobs/Meta/SyncAdSets.php

class GetAdSetsRequest extends Request implements Cacheable, Paginatable
{
    use HasCaching, HasRateLimits;

    protected Method $method = Method::GET;

    protected AdAccount $adAccount;

    protected ?string $campaignId;

    public function __construct(
        AdAccount $adAccount,
        ?string $campaignId = null
    ) {
        $this->adAccount = $adAccount;
        $this->campaignId = $campaignId;
    }

    public function resolveEndpoint(): string
    {
        if (isset($this->campaignId)) {
            return "{$this->campaignId}/adsets";
        }

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
            'targeting',
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

    protected function cacheKey(PendingRequest $pendingRequest): ?string
    {
        $query = $pendingRequest->query()->all();

        if (! array_key_exists('limit', $query)) {
            $query['limit'] = 25;
        }

        $query['ad_account_id'] = $this->adAccount->id;

        return http_build_query($query);
    }

    public function getCacheKey(PendingRequest $pendingRequest)
    {
        return $this->cacheKey($pendingRequest);
    }

    public function cacheExpiryInSeconds(): int
    {
        // 15 minutes
        return 60 * 15;
    }

    protected function getLimiterPrefix(): ?string
    {
        return "ad-account-id-{$this->adAccount->id}";
    }
}
