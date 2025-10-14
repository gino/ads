<?php

namespace App\Jobs;

use App\Http\Integrations\MetaConnector;
use App\Http\Integrations\Requests\CreateAdSetRequest;
use App\Http\Integrations\Requests\Inputs\AdSetInput;
use App\Models\AdCreationFlow;
use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Saloon\RateLimitPlugin\Helpers\ApiRateLimited;

class CreateAdSet implements ShouldQueue
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
        public AdSetInput $input,
        public string $campaignId,
        public string $pixelId,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        if (! $this->adCreationFlow->started_at) {
            $this->adCreationFlow->update([
                'started_at' => now(),
                'status' => 'running',
            ]);
        }

        $user = $this->adCreationFlow->user;
        $adAccount = $this->adCreationFlow->adAccount;

        $adSets = $this->adCreationFlow->adSets;

        $meta = new MetaConnector($user->connection);

        $request = new CreateAdSetRequest(
            adAccount: $adAccount,
            adSet: $this->input,
            campaignId: $this->campaignId,
            pixelId: $this->pixelId
        );

        $response = $meta->send($request)->throw();
        Log::debug('CreateAdSet job response: '.json_encode($response->json()));

        $createdAdSetId = $response->json('id');

        $adSets[$this->adSetIndex]['id'] = $createdAdSetId;
        $this->adCreationFlow->update(['adSets' => $adSets]);
    }

    public function middleware(): array
    {
        return [new ApiRateLimited];
    }
}
