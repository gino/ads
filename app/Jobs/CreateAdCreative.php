<?php

namespace App\Jobs;

use App\Http\Integrations\MetaConnector;
use App\Http\Integrations\Requests\CreateAdCreativeRequest;
use App\Jobs\Middleware\MetaRateLimitMiddleware;
use App\Models\AdCreationFlow;
use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class CreateAdCreative implements ShouldQueue
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
        public string $facebookPageId,
        public string $websiteUrl,
        public ?string $instagramPageId,
        public string $cta,
        public array $primaryTexts,
        public array $headlines,
        public array $descriptions,
        public bool $disableEnhancements,
        public bool $disableMultiAds,
        public ?string $utmParameters,
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
            cta: $this->cta,
            url: $this->websiteUrl,
            primaryTexts: $this->primaryTexts,
            headlines: $this->headlines,
            descriptions: $this->descriptions,
            disableEnhancements: $this->disableEnhancements,
            disableMultiAds: $this->disableMultiAds,
            utmParameters: $this->utmParameters
        );

        $response = $meta->send($request)->throw();
        Log::debug('CreateAdCreative job response: '.json_encode($response->json()));

        $creativeId = $response->json('id');

        $adSets[$this->adSetIndex]['creatives'][$this->creativeIndex]['id'] = $creativeId;
        $this->adCreationFlow->update(['adSets' => $adSets]);
    }

    public function middleware(): array
    {
        return [new MetaRateLimitMiddleware];
    }
}
