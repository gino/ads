<?php

namespace App\Http\Integrations\Requests;

use App\Models\Connection;
use Saloon\Enums\Method;
use Saloon\Http\Request;
use Saloon\PaginationPlugin\Contracts\Paginatable;

// https://github.com/gino/ads/blob/main/app/Jobs/Meta/SyncAdAccounts.php

class GetAdAccountsRequest extends Request implements Paginatable
{
    protected Method $method = Method::GET;

    public function __construct(public Connection $connection) {}

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
            'user_tasks',
            //
            'default_dsa_payor',
            'default_dsa_beneficiary',
            //
            'timezone_name',
            'timezone_offset_hours_utc',
        ];

        return [
            'fields' => implode(',', $fields),
        ];
    }

    protected function getLimiterPrefix(): ?string
    {
        return "connection-id-{$this->connection->id}";
    }
}
