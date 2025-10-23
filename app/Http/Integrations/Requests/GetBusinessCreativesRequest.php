<?php

namespace App\Http\Integrations\Requests;

use App\Http\Integrations\Requests\Traits\HasRateLimits;
use App\Models\AdAccount;
use Saloon\CachePlugin\Traits\HasCaching;
use Saloon\Enums\Method;
use Saloon\Http\PendingRequest;
use Saloon\Http\Request;
use Saloon\PaginationPlugin\Contracts\Paginatable;

// https://developers.facebook.com/docs/marketing-api/reference/ad-account/adcreatives
// https://developers.facebook.com/docs/marketing-api/reference/ad-creative/#fields

class GetBusinessCreativesRequest extends Request implements Paginatable
{
    use HasRateLimits;
    // use HasCaching;

    protected Method $method = Method::GET;

    protected AdAccount $adAccount;

    public function __construct(AdAccount $adAccount)
    {
        $this->adAccount = $adAccount;
    }

    public function resolveEndpoint(): string
    {
        return "{$this->adAccount->external_id}/adcreatives";
    }

    protected function defaultQuery(): array
    {
        // https://developers.facebook.com/docs/marketing-api/reference/ad-creative/#fields
        $fields = [
            'id',
            'name',
            'image_url',
            'video_id',
            // 'previews.ad_format(MOBILE_FEED_STANDARD){body}',
        ];

        return [
            'fields' => implode(',', $fields),
        ];
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

    protected function getLimiterPrefix(): ?string
    {
        return "ad-account-id-{$this->adAccount->id}";
    }
}
