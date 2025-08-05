<?php

namespace App\Jobs\Meta;

use App\Models\AdCampaign;
use App\Models\Connection;
use App\Services\Facebook;
use App\Services\Paginator;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class SyncAdCampaigns implements ShouldQueue
{
    use Queueable;

    protected Connection $metaConnection;

    public function __construct(Connection $metaConnection)
    {
        $this->metaConnection = $metaConnection;
    }

    public function handle(): void
    {
        Log::info('[Meta Sync] Starting SyncAdCampaigns', [
            'connection_id' => $this->metaConnection->id,
        ]);

        try {
            $client = Facebook::client();
            $paginator = new Paginator($client);

            $this->sync($paginator);
        } catch (Throwable $e) {
            Log::error('[Meta Sync] Failed SyncAdCampaigns', [
                'connection_id' => $this->metaConnection->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    private function sync(Paginator $paginator)
    {
        $fields = [
            'id',
            'account_id',
            'name',
            'status',
        ];
        $limit = 25;

        $adAccounts = $this->metaConnection->adAccounts()->get();

        if ($adAccounts->isEmpty()) {
            Log::warning('[Meta Sync] No ad accounts found for campaigns sync', [
                'connection_id' => $this->metaConnection->id,
            ]);

            return;
        }

        Log::debug('[Meta Sync] Starting campaigns sync for ad accounts', [
            'connection_id' => $this->metaConnection->id,
            'ad_account_count' => $adAccounts->count(),
        ]);

        $totalCampaigns = 0;

        foreach ($adAccounts as $adAccount) {
            try {
                $entries = [];

                Log::debug('[Meta Sync] Fetching campaigns for ad account', [
                    'ad_account_id' => $adAccount->id,
                    'external_id' => $adAccount->external_id,
                ]);

                $paginator->fetchEachBatch("/{$adAccount->external_id}/campaigns", [
                    'access_token' => $this->metaConnection->access_token,
                    'fields' => implode(',', $fields),
                    'limit' => $limit,
                    'date_preset' => 'maximum',
                ], function (array $batch) use (&$entries) {
                    $entries = array_merge($entries, $batch);
                });

                if (empty($entries)) {
                    Log::debug('[Meta Sync] No campaigns found for ad account', [
                        'external_id' => $adAccount->external_id,
                    ]);

                    continue;
                }

                $mappedEntries = array_map(function ($entry) use ($adAccount) {
                    return [
                        'external_id' => $entry['id'],
                        'name' => $entry['name'] ?? 'Unknown',
                        'status' => $entry['status'] ?? 'unknown',
                        'ad_account_id' => $adAccount->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }, $entries);

                DB::transaction(function () use ($mappedEntries) {
                    AdCampaign::upsert(
                        $mappedEntries,
                        uniqueBy: ['external_id'],
                        update: ['name', 'status', 'updated_at']
                    );
                });

                $totalCampaigns += count($entries);

                Log::debug('[Meta Sync] Synced campaigns for ad account', [
                    'external_id' => $adAccount->external_id,
                    'campaigns_count' => count($entries),
                ]);

            } catch (Throwable $e) {
                Log::error('[Meta Sync] Error syncing campaigns for ad account', [
                    'ad_account_id' => $adAccount->id,
                    'external_id' => $adAccount->external_id,
                    'error' => $e->getMessage(),
                ]);

                // Continue with next ad account instead of failing entirely
                continue;
            }
        }

        $this->metaConnection->update([
            'last_synced' => array_merge(
                $this->metaConnection->last_synced ?? [],
                ['ad_campaigns' => now()->toDateTimeString()]
            ),
        ]);

        Log::info('[Meta Sync] Completed campaigns sync', [
            'connection_id' => $this->metaConnection->id,
            'total_campaigns' => $totalCampaigns,
        ]);
    }
}
