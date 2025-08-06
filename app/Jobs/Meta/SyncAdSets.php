<?php

namespace App\Jobs\Meta;

use App\Models\AdSet;
use App\Models\Connection;
use App\Services\Facebook;
use App\Services\Paginator;
use App\SyncType;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class SyncAdSets implements ShouldQueue
{
    use Queueable;

    protected Connection $metaConnection;

    public function __construct(Connection $metaConnection)
    {
        $this->metaConnection = $metaConnection;
    }

    public function handle(): void
    {
        Log::info('[Meta Sync] Starting SyncAdSets', [
            'connection_id' => $this->metaConnection->id,
        ]);

        try {
            $client = Facebook::client();
            $paginator = new Paginator($client);

            $this->sync($paginator);
        } catch (Throwable $e) {
            Log::error('[Meta Sync] Failed SyncAdSets', [
                'connection_id' => $this->metaConnection->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    private function sync(Paginator $paginator)
    {
        // https://developers.facebook.com/docs/marketing-api/reference/ad-campaign
        $fields = [
            'id',
            'name',
            'status',
        ];
        $limit = 25;

        $adAccounts = $this->metaConnection->adAccounts()->with('adCampaigns')->get();

        if ($adAccounts->isEmpty()) {
            Log::warning('[Meta Sync] No ad accounts found for ad sets sync', [
                'connection_id' => $this->metaConnection->id,
            ]);

            return;
        }

        $totalAdSets = 0;
        $totalCampaigns = $adAccounts->sum(fn ($account) => $account->adCampaigns->count());

        Log::debug('[Meta Sync] Starting ad sets sync', [
            'connection_id' => $this->metaConnection->id,
            'ad_accounts_count' => $adAccounts->count(),
            'total_campaigns' => $totalCampaigns,
        ]);

        foreach ($adAccounts as $adAccount) {
            if ($adAccount->adCampaigns->isEmpty()) {
                Log::debug('[Meta Sync] No campaigns found for ad account', [
                    'external_id' => $adAccount->external_id,
                ]);

                continue;
            }

            foreach ($adAccount->adCampaigns as $adCampaign) {
                try {
                    $entries = [];

                    $paginator->fetchEachBatch("/{$adCampaign->external_id}/adsets", [
                        'access_token' => $this->metaConnection->access_token,
                        'fields' => implode(',', $fields),
                        'limit' => $limit,
                        'date_preset' => 'maximum',
                    ], function (array $batch) use (&$entries) {
                        $entries = array_merge($entries, $batch);
                    });

                    if (empty($entries)) {
                        Log::debug('[Meta Sync] No ad sets found for campaign', [
                            'campaign_external_id' => $adCampaign->external_id,
                        ]);

                        continue;
                    }

                    $mappedEntries = array_map(function ($entry) use ($adCampaign) {
                        return [
                            'external_id' => $entry['id'],
                            'name' => $entry['name'] ?? 'Unknown',
                            'status' => $entry['status'] ?? 'unknown',
                            'ad_campaign_id' => $adCampaign->id,
                        ];
                    }, $entries);

                    DB::transaction(function () use ($mappedEntries) {
                        AdSet::upsert(
                            $mappedEntries,
                            uniqueBy: ['external_id'],
                            update: ['name', 'status']
                        );
                    });

                    $totalAdSets += count($entries);

                    Log::debug('[Meta Sync] Synced ad sets for campaign', [
                        'campaign_external_id' => $adCampaign->external_id,
                        'ad_sets_count' => count($entries),
                    ]);

                } catch (Throwable $e) {
                    Log::error('[Meta Sync] Error syncing ad sets for campaign', [
                        'campaign_id' => $adCampaign->id,
                        'campaign_external_id' => $adCampaign->external_id,
                        'error' => $e->getMessage(),
                    ]);

                    // Continue with next campaign instead of failing entirely
                    continue;
                }
            }
        }

        $this->metaConnection->last_synced->refresh(SyncType::AD_SETS);
        $this->metaConnection->save();

        Log::info('[Meta Sync] Completed ad sets sync', [
            'connection_id' => $this->metaConnection->id,
            'total_ad_sets' => $totalAdSets,
        ]);
    }
}
