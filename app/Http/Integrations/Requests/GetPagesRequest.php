<?php

namespace App\Http\Integrations\Requests;

use App\Models\AdAccount;
use Saloon\Enums\Method;
use Saloon\Http\Request;
use Saloon\PaginationPlugin\Contracts\Paginatable;

class GetPagesRequest extends Request implements Paginatable
{
    protected Method $method = Method::GET;

    protected AdAccount $adAccount;

    public function __construct(AdAccount $adAccount)
    {
        $this->adAccount = $adAccount;
    }

    public function resolveEndpoint(): string
    {
        $businessId = $this->adAccount->business_id;

        if (! $businessId) {
            return "{$this->adAccount->external_id}/promote_pages";
        }

        return "{$businessId}/owned_pages";
    }

    protected function defaultQuery(): array
    {
        // https://developers.facebook.com/docs/graph-api/reference/page/#fields
        $fields = [
            'id',
            'name',
        ];

        return [
            'fields' => implode(',', $fields),
        ];
    }
}
