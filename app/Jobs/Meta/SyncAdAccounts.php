<?php

namespace App\Jobs\Meta;

use App\Models\AdAccount;
use App\Models\Connection;
use App\Services\Facebook;
use App\Services\Paginator;
use App\SyncType;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class SyncAdAccounts implements ShouldQueue
{
    use Queueable;

    protected Connection $metaConnection;

    public function __construct(Connection $metaConnection)
    {
        $this->metaConnection = $metaConnection;
    }

    public function handle(): void
    {
        Log::info('[Meta Sync] Starting SyncAdAccounts', [
            'connection_id' => $this->metaConnection->id,
        ]);

        try {
            $client = Facebook::client();
            $paginator = new Paginator($client);

            $this->sync($paginator);
        } catch (Throwable $e) {
            Log::error('[Meta Sync] Failed SyncAdAccounts', [
                'connection_id' => $this->metaConnection->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    private function sync(Paginator $paginator)
    {
        // https://developers.facebook.com/docs/marketing-api/reference/ad-account/#overview
        $fields = [
            'id',
            'name',
            'account_status',
            'currency',
        ];
        $limit = 25;
        $entries = [];

        $paginator->fetchEachBatch('/me/adaccounts', [
            'access_token' => $this->metaConnection->access_token,
            'fields' => implode(',', $fields),
            'limit' => $limit,
        ], function (array $batch) use (&$entries) {
            $entries = array_merge($entries, $batch);
        });

        if (empty($entries)) {
            Log::warning('[Meta Sync] No ad accounts found', [
                'connection_id' => $this->metaConnection->id,
            ]);

            return;
        }

        $mappedEntries = array_map(function ($entry) {
            return [
                'external_id' => $entry['id'],
                'name' => $entry['name'] ?? 'Unknown',
                'currency' => $entry['currency'] ?? null,
                'status' => $entry['account_status'] ?? 'unknown',
                'connection_id' => $this->metaConnection->id,
            ];
        }, $entries);

        DB::transaction(function () use ($mappedEntries) {
            AdAccount::upsert(
                $mappedEntries,
                uniqueBy: ['external_id'],
                update: [
                    'name',
                    'currency',
                    'status',
                ]
            );
        });

        $this->metaConnection->last_synced->refresh(SyncType::AD_ACCOUNTS);
        $this->metaConnection->save();

        Log::info('[Meta Sync] Successfully synced ad accounts', [
            'connection_id' => $this->metaConnection->id,
            'count' => count($mappedEntries),
        ]);
    }
}
