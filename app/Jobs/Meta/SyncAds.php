<?php

namespace App\Jobs\Meta;

use App\Models\Ad;
use App\Models\Connection;
use App\Services\Facebook;
use App\Services\Paginator;
use App\SyncType;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class SyncAds implements ShouldQueue
{
    use Queueable;

    protected Connection $metaConnection;

    public function __construct(Connection $metaConnection)
    {
        $this->metaConnection = $metaConnection;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('[Meta Sync] Starting SyncAds', [
            'connection_id' => $this->metaConnection->id,
        ]);

        try {
            $client = Facebook::client();
            $paginator = new Paginator($client);

            $this->sync($paginator);
        } catch (Throwable $e) {
            Log::error('[Meta Sync] Failed SyncAds', [
                'connection_id' => $this->metaConnection->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    private function sync(Paginator $paginator)
    {
        // https://developers.facebook.com/docs/marketing-api/reference/ad-campaign/ads/
        $fields = [
            'id',
            'name',
            'status',
        ];
        $limit = 25;

        $adAccounts = $this->metaConnection->adAccounts()->get();

        if ($adAccounts->isEmpty()) {
            Log::warning('[Meta Sync] No ad accounts found for ads sync', [
                'connection_id' => $this->metaConnection->id,
            ]);

            return;
        }

        Log::debug('[Meta Sync] Starting ads sync for ad accounts', [
            'connection_id' => $this->metaConnection->id,
            'ad_account_count' => $adAccounts->count(),
        ]);

        $totalAds = 0;

        foreach ($adAccounts as $adAccount) {
            if ($adAccount->adCampaigns->isEmpty()) {
                Log::debug('[Meta Sync] No campaigns found for ad account', [
                    'external_id' => $adAccount->external_id,
                ]);

                continue;
            }

            foreach ($adAccount->adCampaigns as $adCampaign) {
                if ($adCampaign->adsets->isEmpty()) {
                    Log::debug('[Meta Sync] No ad sets found for ad campaign', [
                        'external_id' => $adCampaign->external_id,
                    ]);

                    continue;
                }

                foreach ($adCampaign->adSets as $adSet) {
                    try {
                        $entries = [];

                        $paginator->fetchEachBatch("/{$adSet->external_id}/ads", [
                            'access_token' => $this->metaConnection->access_token,
                            'fields' => implode(',', $fields),
                            'limit' => $limit,
                            'date_preset' => 'maximum',
                        ], function (array $batch) use (&$entries) {
                            $entries = array_merge($entries, $batch);
                        });

                        if (empty($entries)) {
                            Log::debug('[Meta Sync] No ads found for ad set', [
                                'external_id' => $adSet->external_id,
                            ]);

                            continue;
                        }

                        $mappedEntries = array_map(function ($entry) use ($adSet) {
                            return [
                                'external_id' => $entry['id'],
                                'name' => $entry['name'] ?? 'Unknown',
                                'status' => $entry['status'] ?? 'unknown',
                                'ad_set_id' => $adSet->id,
                            ];
                        }, $entries);

                        DB::transaction(function () use ($mappedEntries) {
                            Ad::upsert(
                                $mappedEntries,
                                uniqueBy: ['external_id'],
                                update: ['name', 'status']
                            );
                        });

                        $totalAds += count($entries);

                        Log::debug('[Meta Sync] Synced ads for ad set', [
                            'external_id' => $adSet->external_id,
                            'ads_count' => count($entries),
                        ]);

                    } catch (Throwable $e) {
                        Log::error('[Meta Sync] Error syncing ads for ad set', [
                            'id' => $adSet->id,
                            'external_id' => $adSet->external_id,
                            'error' => $e->getMessage(),
                        ]);

                        // Continue with next campaign instead of failing entirely
                        continue;
                    }
                }
            }
        }

        $this->metaConnection->last_synced->refresh(SyncType::ADS);
        $this->metaConnection->save();

        Log::info('[Meta Sync] Completed ads sync', [
            'connection_id' => $this->metaConnection->id,
            'total_ads' => $totalAds,
        ]);
    }
}
