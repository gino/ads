<?php

namespace App\Jobs\Meta;

use App\Models\Connection;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Log;

class Sync implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

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
        Log::info('[Meta Sync Dispatcher] Dispatching chained sync jobs', [
            'connection_id' => $this->metaConnection->id,
        ]);

        Bus::chain([
            new SyncAdAccounts($this->metaConnection),
            new SyncAdCampaigns($this->metaConnection),
            new SyncAdSets($this->metaConnection),
            new SyncAds($this->metaConnection),
        ])->dispatch();
    }
}
