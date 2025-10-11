<?php

namespace App\Jobs;

use App\Http\Integrations\MetaConnector;
use App\Http\Integrations\Requests\UploadAdCreativeRequest;
use App\Models\AdCreationFlow;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Saloon\RateLimitPlugin\Helpers\ApiRateLimited;

class UploadAdCreative implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public AdCreationFlow $adCreationFlow,
        public string $path,
        public string $label
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $user = $this->adCreationFlow->user;
        $adAccount = $this->adCreationFlow->adAccount;

        $meta = new MetaConnector($user->connection);

        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk('uploaded-ads');

        $creative = $disk->readStream($this->path);

        $request = new UploadAdCreativeRequest(
            adAccount: $adAccount,
            creative: $creative,
            filename: $this->path,
            label: $this->label,
        );

        $response = $meta->send($request)->throw();
        $images = collect($response->json('images'));
        $hash = $images->first()['hash'];

        // TODO: Now we have to update $flow with the updated hash for the matching creative so our jobs after this one, are aware of the hash

        $disk->delete($this->path);
    }

    public function middleware(): array
    {
        return [new ApiRateLimited];
    }
}
