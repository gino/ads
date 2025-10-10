<?php

namespace App\Jobs;

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
        public AdCreationFlow $adCreationFlow
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        //
    }

    public function middleware(): array
    {
        return [new ApiRateLimited];
    }
}
