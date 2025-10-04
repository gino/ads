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
        public string $cta,
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

        $url = 'https://google.com';

        // https://developers.facebook.com/docs/marketing-api/reference/ad-creative-object-story-spec/
        if ($this->isVideo) {
            // Video
            $spec['video_data'] = [
                'image_hash' => $this->hash,
                'call_to_action' => [
                    'type' => $this->cta,
                    'value' => [
                        'link' => $url,
                    ],
                ],
            ];
        } else {
            $spec['link_data'] = [
                'image_hash' => $this->hash,
                'link' => $url,
                'call_to_action' => [
                    'type' => $this->cta,
                    'value' => [
                        'link' => $url,
                    ],
                ],
            ];
        }

        // https://developers.facebook.com/docs/marketing-api/reference/ad-creative#fields
        return [
            'name' => $this->name,
            'object_story_spec' => $spec,
            // https://developers.facebook.com/docs/marketing-api/creative/multi-advertiser-ads/
            'contextual_multi_ads' => [
                'enroll_status' => 'OPT_OUT',
            ],
        ];
    }
}
