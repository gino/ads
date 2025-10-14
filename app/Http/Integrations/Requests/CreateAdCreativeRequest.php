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
        public ?string $videoId,
        public string $cta,
        public string $url,
        public array $primaryTexts,
        public array $headlines,
        public array $descriptions,
    ) {}

    public function resolveEndpoint(): string
    {
        return "{$this->adAccount->external_id}/adcreatives";
    }

    // https://chatgpt.com/c/68dadcc5-64c4-832a-a647-4f5ec1736a32
    protected function defaultBody(): array
    {
        $objectStorySpec = [
            'page_id' => $this->facebookPageId,
        ];

        if ($this->instagramPageId) {
            $objectStorySpec['instagram_user_id'] = $this->instagramPageId;
        }

        $hasVariations = count($this->primaryTexts) > 1 || count($this->headlines) > 1 || count($this->descriptions) > 1;

        // https://developers.facebook.com/docs/marketing-api/reference/ad-creative-object-story-spec/
        if (! is_null($this->videoId)) {
            // Video ad creative
            // https://developers.facebook.com/docs/marketing-api/reference/ad-creative-video-data/
            $objectStorySpec['video_data'] = [
                'image_hash' => $this->hash,
                'video_id' => $this->videoId,
                'message' => $this->primaryTexts[0] ?? null,
                'name' => $this->headlines[0] ?? null,
                'description' => $this->descriptions[0] ?? null,
                'call_to_action' => [
                    'type' => $this->cta,
                    'value' => [
                        'link' => $this->url,
                    ],
                ],
            ];
        } else {
            // Image ad creative
            // https://developers.facebook.com/docs/marketing-api/reference/ad-creative-link-data/
            $objectStorySpec['link_data'] = [
                'image_hash' => $this->hash,
                'link' => $this->url,
                'message' => $this->primaryTexts[0] ?? null,
                'name' => $this->headlines[0] ?? null,
                'description' => $this->descriptions[0] ?? null,
                'call_to_action' => [
                    'type' => $this->cta,
                    'value' => [
                        'link' => $this->url,
                    ],
                ],
            ];
        }

        $data = [
            'name' => $this->name,
            'object_story_spec' => $objectStorySpec,
            // https://developers.facebook.com/docs/marketing-api/creative/multi-advertiser-ads/
            'contextual_multi_ads' => [
                'enroll_status' => 'OPT_OUT',
            ],
        ];

        if ($hasVariations) {
            $data['asset_feed_spec'] = [
                'optimization_type' => 'DEGREES_OF_FREEDOM',
                'bodies' => collect($this->primaryTexts)->map(fn ($text) => ['text' => $text])->toArray(),
                'titles' => collect($this->headlines)->map(fn ($text) => ['text' => $text])->toArray(),
                'descriptions' => collect($this->descriptions)->map(fn ($text) => ['text' => $text])->toArray(),
            ];
        }

        // https://developers.facebook.com/docs/marketing-api/reference/ad-creative#fields
        return $data;
    }
}
