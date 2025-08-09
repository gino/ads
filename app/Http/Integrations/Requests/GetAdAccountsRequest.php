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

    protected Connection $connection;

    public function __construct(Connection $connection)
    {
        $this->connection = $connection;
    }

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
        ];

        return [
            'fields' => implode(',', $fields),
        ];
    }
}
