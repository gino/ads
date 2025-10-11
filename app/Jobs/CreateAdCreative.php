<?php

namespace App\Jobs;

use App\Http\Integrations\MetaConnector;
use App\Http\Integrations\Requests\CreateAdCreativeRequest;
use App\Models\AdCreationFlow;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Saloon\RateLimitPlugin\Helpers\ApiRateLimited;

class CreateAdCreative implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public AdCreationFlow $adCreationFlow,
        public int $adSetIndex,
        public int $creativeIndex,
        public string $label,
        public string $facebookPageId,
        public ?string $instagramPageId,
        public string $cta,
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

        $request = new CreateAdCreativeRequest(
            adAccount: $adAccount,
            name: $this->label,
            hash: $creative['hash'],
            videoId: $creative['video_id'] ?? null,
            facebookPageId: $this->facebookPageId,
            instagramPageId: $this->instagramPageId ?? null,
            cta: $this->cta
        );

        $response = $meta->send($request)->throw();
        Log::debug('CreateAdCreative job response: '.json_encode($response->json()));

        $creativeId = $response->json('id');

        $adSets[$this->adSetIndex]['creatives'][$this->creativeIndex]['id'] = $creativeId;
        $this->adCreationFlow->update(['adSets' => $adSets]);
    }

    public function middleware(): array
    {
        return [new ApiRateLimited];
    }
}
