<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

// https://chatgpt.com/c/68e165a6-ebcc-832c-8bb1-154f77b8d92b
// After creating, notify the user that their ad has been launched (via email)

class CreateAd implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        //
    }
}
