<?php

namespace App\Jobs;

use App\Models\AdCreationFlow;
use App\Models\User;
use App\Notifications\AdCreationFlowCompleted as AdCreationFlowCompletedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class AdCreationFlowCompleted implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public AdCreationFlow $adCreationFlow,
        public User $user,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $this->adCreationFlow->update(['status' => 'completed', 'completed_at' => now()]);
        $this->user->notify(new AdCreationFlowCompletedNotification($this->adCreationFlow));
    }
}
