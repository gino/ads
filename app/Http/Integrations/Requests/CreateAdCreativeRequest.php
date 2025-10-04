<?php

namespace App\Http\Integrations\Requests;

use App\Models\AdAccount;
use Saloon\Contracts\Body\HasBody;
use Saloon\Enums\Method;
use Saloon\Http\Request;
use Saloon\Traits\Body\HasJsonBody;

class CreateAdCreativeRequest extends Request implements HasBody
{
    use HasJsonBody;

    protected Method $method = Method::POST;

    public function __construct(
        public AdAccount $adAccount,
        public string $name,
        public string $hash,
        public string $facebookPageId,
        public ?string $instagramPageId,
        public bool $isVideo,
    ) {}

    public function resolveEndpoint(): string
    {
        return "{$this->adAccount->external_id}/adcreatives";
    }

    protected function defaultBody(): array
    {
        // https://chatgpt.com/c/68dadcc5-64c4-832a-a647-4f5ec1736a32

        $spec = [
            'page_id' => $this->facebookPageId,
        ];

        if ($this->instagramPageId) {
            $spec['instagram_user_id'] = $this->instagramPageId;
        }

        // https://developers.facebook.com/docs/marketing-api/reference/ad-creative-object-story-spec/
        if ($this->isVideo) {
            // Video
            $spec['video_data'] = [
                'image_hash' => $this->hash,
            ];
        } else {
            // Photo
            $spec['photo_data'] = [
                'image_hash' => $this->hash,
            ];
        }

        // https://developers.facebook.com/docs/marketing-api/reference/ad-creative#fields
        return [
            'name' => $this->name,
            'object_story_spec' => $spec,
        ];
    }
}
