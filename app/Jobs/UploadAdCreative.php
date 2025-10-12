<?php

namespace App\Jobs;

use App\Http\Integrations\MetaConnector;
use App\Http\Integrations\Requests\UploadAdCreativeRequest;
use App\Models\AdCreationFlow;
use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Saloon\RateLimitPlugin\Helpers\ApiRateLimited;

class UploadAdCreative implements ShouldQueue
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
        public string $path,
        public string $label
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        if ($this->batch()?->cancelled()) {
            return;
        }

        $user = $this->adCreationFlow->user;
        $adAccount = $this->adCreationFlow->adAccount;

        $adSets = $this->adCreationFlow->adSets;

        $meta = new MetaConnector($user->connection);

        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk('uploaded-ads');

        $creative = $disk->readStream($this->path);

        $request = new UploadAdCreativeRequest(
            adAccount: $adAccount,
            creative: $creative,
            filename: $this->path,
            label: $this->label,
            isVideo: false
        );

        $response = $meta->send($request)->throw();
        Log::debug('UploadAdCreative job response: '.json_encode($response->json()));

        $images = collect($response->json('images'));
        $hash = $images->first()['hash'];

        $adSets[$this->adSetIndex]['creatives'][$this->creativeIndex]['hash'] = $hash;
        $this->adCreationFlow->update(['adSets' => $adSets]);

        $disk->delete($this->path);
    }

    public function middleware(): array
    {
        return [new ApiRateLimited];
    }
}
