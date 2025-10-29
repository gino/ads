<?php

namespace App\Jobs;

use App\Http\Integrations\MetaConnector;
use App\Http\Integrations\Requests\CreateAdRequest;
use App\Jobs\Middleware\MetaRateLimitMiddleware;
use App\Models\AdCreationFlow;
use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class CreateAd implements ShouldQueue
{
    use Batchable, Queueable;

    public $tries = 15;

    public $backoff = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public AdCreationFlow $adCreationFlow,
        public int $adSetIndex,
        public int $creativeIndex,
        public string $label,
        public bool $pausedByDefault
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $user = $this->adCreationFlow->user;
        $adAccount = $this->adCreationFlow->adAccount;

        $adSets = $this->adCreationFlow->adSets;

        $meta = new MetaConnector($user->connection);

        $creative = $adSets[$this->adSetIndex]['creatives'][$this->creativeIndex];

        $request = new CreateAdRequest(
            adAccount: $adAccount,
            name: $this->label,
            adSetId: $adSets[$this->adSetIndex]['id'],
            creativeId: $creative['id'],
            pausedByDefault: $this->pausedByDefault
        );

        $response = $meta->send($request)->throw();
        Log::debug('CreateAd job response: '.json_encode($response->json()));
    }

    public function middleware(): array
    {
        return [new MetaRateLimitMiddleware];
    }
}
