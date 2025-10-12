<?php

namespace App\Http\Integrations\Requests;

use App\Models\AdAccount;
use Saloon\CachePlugin\Traits\HasCaching;
use Saloon\Enums\Method;
use Saloon\Http\Request;
use Saloon\PaginationPlugin\Contracts\Paginatable;

// https://developers.facebook.com/docs/marketing-api/reference/ad-account/adcreatives
// https://developers.facebook.com/docs/marketing-api/reference/ad-creative/#fields

class GetBusinessCreativesRequest extends Request implements Paginatable
{
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
        ];

        return [
            'fields' => implode(',', $fields),
        ];
    }
}
