<?php

namespace App\Jobs;

use App\Models\AdAccount;
use App\Models\Connection;
use App\Services\Facebook;
use App\Services\Paginator;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class SyncDataFromMeta implements ShouldQueue
{
    use Queueable;

    protected Connection $c;

    /**
     * Create a new job instance.
     */
    public function __construct(Connection $c)
    {
        $this->c = $c;
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

        // After all syncing, update the 'last_synced_at' column
        $this->c->update([
            'last_synced_at' => now(),
        ]);
    }

    private function syncAdAccounts(Paginator $paginator)
    {
        $limit = 5;
        $fields = [
            'account_id',
            'name',
            'account_status',
            'currency',
            'business',
            'owner',
        ];
        $entries = [];

        $paginator->fetchEachBatch('/me/adaccounts', [
            'access_token' => $this->c->access_token,
            // https://developers.facebook.com/docs/marketing-api/reference/ad-account/#overview
            'fields' => implode(',', $fields),
            'limit' => $limit,
        ], function (array $batch) use (&$entries) {
            $entries = array_merge($entries, $batch);
        });

        $mappedEntries = array_map(function ($entry) {
            return [
                'account_id' => $entry['account_id'],
                'name' => $entry['name'],
                'currency' => $entry['currency'],
                'connection_id' => $this->c->id,
            ];
        }, $entries);

        AdAccount::upsert($mappedEntries, uniqueBy: ['account_id'], update: ['name', 'currency']);

        Log::debug('[Sync] Completed sync of '.count($entries).' ad account(s)');
    }
}
