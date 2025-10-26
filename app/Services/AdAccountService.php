<?php

namespace App\Services;

use App\Http\Integrations\MetaConnector;
use App\Http\Integrations\Requests\GetAdAccountsRequest;
use App\Models\AdAccount;
use App\Models\Connection;

class AdAccountService
{
    public static function fetchAdAccounts(Connection $connection)
    {
        $meta = new MetaConnector($connection);
        $paginator = $meta->paginate(new GetAdAccountsRequest($connection));

        return $paginator->collect();
    }

    public static function syncAdAccounts(mixed $adAccounts, Connection $connection)
    {
        AdAccount::upsert(
            $adAccounts->map(fn ($adAccount) => AdAccountService::normalizeAdAccount($adAccount, $connection))->all(),
            uniqueBy: ['external_id'],
            update: [
                'name',
                'currency',
                'status',
                'business_id',
                'timezone',
                'timezone_offset_utc',
                'permissions',
            ]);
    }

    public static function normalizeAdAccount(mixed $adAccount, Connection $connection)
    {
        return [
            'external_id' => $adAccount['id'],
            'name' => $adAccount['name'],
            'currency' => $adAccount['currency'],
            'status' => $adAccount['account_status'],
            'connection_id' => $connection->id,
            'business_id' => $adAccount['business']['id'] ?? null,
            'timezone' => $adAccount['timezone_name'],
            'timezone_offset_utc' => $adAccount['timezone_offset_hours_utc'],
            'permissions' => json_encode($adAccount['user_tasks'] ?? []),
        ];
    }
}
