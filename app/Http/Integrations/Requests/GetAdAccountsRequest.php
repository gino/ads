<?php

namespace App\Http\Integrations\Requests;

use Saloon\Enums\Method;
use Saloon\Http\Request;
use Saloon\PaginationPlugin\Contracts\Paginatable;

// https://github.com/gino/ads/blob/main/app/Jobs/Meta/SyncAdAccounts.php

class GetAdAccountsRequest extends Request implements Paginatable
{
    // Add caching but disable for login call

    protected Method $method = Method::GET;

    public function resolveEndpoint(): string
    {
        return '/me/adaccounts';
    }

    protected function defaultQuery(): array
    {
        // https://developers.facebook.com/docs/marketing-api/reference/ad-account/#fields
        $fields = [
            'id',
            'name',
            'account_status',
            'currency',
            'business{id}',
            //
            'default_dsa_payor',
            'default_dsa_beneficiary',
        ];

        return [
            'fields' => implode(',', $fields),
        ];
    }
}
