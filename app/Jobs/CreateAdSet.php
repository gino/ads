<?php

namespace App\Jobs;

use App\Http\Integrations\MetaConnector;
use App\Http\Integrations\Requests\CreateAdSetRequest;
use App\Http\Integrations\Requests\Inputs\AdSetInput;
use App\Models\AdCreationFlow;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Saloon\RateLimitPlugin\Helpers\ApiRateLimited;

class CreateAdSet implements ShouldQueue
{
    use Queueable;

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

        $createdAdSetId = $meta->send($request)->throw()->json('id');

        $adSets[$this->adSetIndex]['external_id'] = $createdAdSetId;
        $adSets[$this->adSetIndex]['status'] = 'completed';
        $this->adCreationFlow->update(['adSets' => $adSets]);
    }

    public function middleware(): array
    {
        return [new ApiRateLimited];
    }
}
