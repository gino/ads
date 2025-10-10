<?php

namespace App\Jobs;

use App\Http\Integrations\MetaConnector;
use App\Http\Integrations\Requests\CreateAdCreativeRequest;
use App\Http\Integrations\Requests\CreateAdRequest;
use App\Models\AdAccount;
use App\Models\Connection;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Saloon\RateLimitPlugin\Helpers\ApiRateLimited;

// https://chatgpt.com/c/68e165a6-ebcc-832c-8bb1-154f77b8d92b
// After creating, notify the user that their ad has been launched (via email)

class CreateAd implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public AdAccount $adAccount,
        public Connection $metaConnection,
        //
        public string $adSetId,
        public string $name,
        public string $hash,
        public ?string $videoId,
        public string $facebookPageId,
        public ?string $instagramPageId,
        public string $cta,
        //
        public bool $pausedByDefault
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // https://docs.saloon.dev/installable-plugins/handling-rate-limits

        $meta = new MetaConnector($this->metaConnection);

        // Should be a seperate job?
        $createdAdCreativeResponse = $meta->send(new CreateAdCreativeRequest(
            adAccount: $this->adAccount,
            name: $this->name,
            hash: $this->hash,
            videoId: $this->videoId ?? null,
            facebookPageId: $this->facebookPageId,
            instagramPageId: $this->instagramPageId ?? null,
            //
            cta: $this->cta
        ))->throw();

        $creativeId = $createdAdCreativeResponse->json('id');

        // Should be a seperate job?
        $meta->send(new CreateAdRequest(
            adAccount: $this->adAccount,
            name: $this->name,
            creativeId: $creativeId,
            adSetId: $this->adSetId,
            pausedByDefault: $this->pausedByDefault
        ))->throw();
    }

    public function middleware(): array
    {
        return [new ApiRateLimited];
    }
}
