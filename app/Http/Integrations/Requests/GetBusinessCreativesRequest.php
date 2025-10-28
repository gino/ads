<?php

namespace App\Http\Integrations\Requests;

use App\Http\Integrations\Requests\Traits\HasRateLimits;
use App\Models\AdAccount;
use ReflectionClass;
use Saloon\CachePlugin\Traits\HasCaching;
use Saloon\Enums\Method;
use Saloon\Http\Request;

// https://developers.facebook.com/docs/marketing-api/reference/ad-account/adcreatives
// https://developers.facebook.com/docs/marketing-api/reference/ad-creative/#fields

class GetBusinessCreativesRequest extends Request
{
    use HasRateLimits;
    // use HasCaching;

    protected Method $method = Method::GET;

    public function __construct(
        protected AdAccount $adAccount,
        protected ?int $limit,
        protected ?string $after = null
    ) {}

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
            'object_story_spec',
            // 'previews.ad_format(MOBILE_FEED_STANDARD){body}',
        ];

        $query = [
            'fields' => implode(',', $fields),
            'limit' => $this->limit,
        ];

        if ($this->after) {
            $query['after'] = $this->after;
        }

        return $query;
    }

    protected function getLimiterPrefix(): ?string
    {
        $requestName = (new ReflectionClass($this))->getShortName();

        return "ad-account-id-{$this->adAccount->id}:{$requestName}";
    }
}
