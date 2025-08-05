<?php

namespace App\Jobs;

use App\Models\AdAccount;
use App\Models\AdCampaign;
use App\Models\AdSet;
use App\Models\Connection;
use App\Services\Facebook;
use App\Services\Paginator;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class SyncDataFromMeta implements ShouldQueue
{
    use Queueable;

    protected Connection $metaConnection;

    /**
     * Create a new job instance.
     */
    public function __construct(Connection $metaConnection)
    {
        $this->metaConnection = $metaConnection;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $client = Facebook::client();
        $paginator = new Paginator($client);

        // Sync ad accounts
        $this->syncAdAccounts($paginator);
        $this->syncAdCampaigns($paginator);
        $this->syncAdSets($paginator);

        // After all syncing, update the 'last_synced_at' column on the connection
        $this->metaConnection->update([
            'last_synced_at' => now(),
        ]);
    }

    private function syncAdAccounts(Paginator $paginator)
    {
        // https://developers.facebook.com/docs/marketing-api/reference/ad-account/#overview
        $fields = [
            'account_id',
            'name',
            'account_status',
            'currency',
            'business',
            'owner',
        ];
        $limit = 5;
        $entries = [];

        $paginator->fetchEachBatch('/me/adaccounts', [
            'access_token' => $this->metaConnection->access_token,
            'fields' => implode(',', $fields),
            'limit' => $limit,
        ], function (array $batch) use (&$entries) {
            $entries = array_merge($entries, $batch);
        });

        $mappedEntries = array_map(function ($entry) {
            return [
                'external_id' => $entry['id'],
                //
                'name' => $entry['name'],
                'currency' => $entry['currency'],
                'status' => $entry['account_status'],
                //
                'connection_id' => $this->metaConnection->id,
            ];
        }, $entries);

        AdAccount::upsert(
            $mappedEntries,
            uniqueBy: ['external_id'],
            update: [
                'name',
                'currency',
                'status',
            ]);

        Log::debug('[Sync] Completed sync of '.count($entries).' ad account(s)');
    }

    private function syncAdCampaigns(Paginator $paginator)
    {
        // https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group
        $fields = [
            'id',
            'account_id',
            'name',
            'status',
        ];
        $limit = 5;

        $adAccounts = $this->metaConnection->adAccounts()->get();

        foreach ($adAccounts as $adAccount) {
            $entries = [];

            $paginator->fetchEachBatch("/{$adAccount->external_id}/campaigns", [
                'access_token' => $this->metaConnection->access_token,
                'fields' => implode(',', $fields),
                'limit' => $limit,
                'date_preset' => 'maximum',
            ], function (array $batch) use (&$entries) {
                $entries = array_merge($entries, $batch);
            });

            $mappedEntries = array_map(function ($entry) use ($adAccount) {
                return [
                    'external_id' => $entry['id'],
                    //
                    'name' => $entry['name'],
                    'status' => $entry['status'],
                    //
                    'ad_account_id' => $adAccount->id,
                ];
            }, $entries);

            AdCampaign::upsert(
                $mappedEntries,
                uniqueBy: ['external_id'],
                update: [
                    'name',
                    'status',
                ]);

            Log::debug('[Sync] Completed sync of '.count($entries).' ad campaigns(s) for '.$adAccount->external_id);
        }
    }

    private function syncAdSets(Paginator $paginator)
    {
        // https://developers.facebook.com/docs/marketing-api/reference/ad-campaign
        $fields = [
            'id',
            'name',
            'status',
        ];
        $limit = 5;

        $adAccounts = $this->metaConnection->adAccounts()->with('adCampaigns')->get();

        foreach ($adAccounts as $adAccount) {
            foreach ($adAccount->adCampaigns as $adCampaign) {
                $entries = [];

                $paginator->fetchEachBatch("/{$adCampaign->external_id}/adsets", [
                    'access_token' => $this->metaConnection->access_token,
                    'fields' => implode(',', $fields),
                    'limit' => $limit,
                    'date_preset' => 'maximum',
                ], function (array $batch) use (&$entries) {
                    $entries = array_merge($entries, $batch);
                });

                $mappedEntries = array_map(function ($entry) use ($adCampaign) {
                    return [
                        'external_id' => $entry['id'],
                        //
                        'name' => $entry['name'],
                        'status' => $entry['status'],
                        //
                        'ad_campaign_id' => $adCampaign->id,
                    ];
                }, $entries);

                AdSet::upsert(
                    $mappedEntries,
                    uniqueBy: ['external_id'],
                    update: [
                        'name',
                        'status',
                    ]);

                Log::debug('[Sync] Completed sync of '.count($entries).' ad set(s) for '.$adCampaign->external_id);
            }
        }
    }
}
