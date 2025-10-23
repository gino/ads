<?php

namespace App\Http\Integrations\Requests;

use App\Http\Integrations\Requests\Traits\HasRateLimits;
use App\Models\AdAccount;
use ReflectionClass;
use Saloon\Contracts\Body\HasBody;
use Saloon\Enums\Method;
use Saloon\Http\Request;
use Saloon\Traits\Body\HasJsonBody;

class CreateAdCreativeRequest extends Request implements HasBody
{
    use HasJsonBody, HasRateLimits;

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
        public bool $disableEnhancements,
        public bool $disableMultiAds,
        public ?string $utmParameters
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
        $isVideo = ! is_null($this->videoId);

        // https://developers.facebook.com/docs/marketing-api/reference/ad-creative-object-story-spec/
        if ($isVideo) {
            // Video ad creative
            // https://developers.facebook.com/docs/marketing-api/reference/ad-creative-video-data/
            $objectStorySpec['video_data'] = [
                'image_hash' => $this->hash,
                'video_id' => $this->videoId,
                'message' => $this->primaryTexts[0] ?? null,
                'title' => $this->headlines[0] ?? null,
                'link_description' => $this->descriptions[0] ?? null,
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
        ];

        if ($this->disableMultiAds) {
            // https://developers.facebook.com/docs/marketing-api/creative/multi-advertiser-ads/
            $data['contextual_multi_ads'] = [
                'enroll_status' => 'OPT_OUT',
            ];
        }

        if ($hasVariations) {
            $data['asset_feed_spec'] = [
                'optimization_type' => 'DEGREES_OF_FREEDOM',
                'bodies' => collect($this->primaryTexts)->map(fn ($text) => ['text' => $text])->toArray(),
                'titles' => collect($this->headlines)->map(fn ($text) => ['text' => $text])->toArray(),
                'descriptions' => collect($this->descriptions)->map(fn ($text) => ['text' => $text])->toArray(),
            ];
        }

        // Disable standard-enabled Adv+ enhancements
        if ($this->disableEnhancements) {
            // https://developers.facebook.com/docs/marketing-api/advantage-catalog-ads/standard-enhancements/
            // https://developers.facebook.com/docs/marketing-api/creative/advantage-creative/get-started
            $commonFeatures = [
                'text_optimizations',
                'inline_comment',
                'enhance_cta',
                'image_background_gen',
                'image_templates',
                'image_touchups',
                'image_brightness_and_contrast',
                'standard_enhancements_catalog',
            ];

            $videoFeatures = [
                'video_auto_crop',
            ];

            $features = collect($commonFeatures)
                ->merge($isVideo ? $videoFeatures : [])
                ->mapWithKeys(fn ($feature) => [$feature => ['enroll_status' => 'OPT_OUT']])
                ->all();

            $data['degrees_of_freedom_spec'] = [
                'creative_features_spec' => $features,
            ];
        }

        if (! is_null($this->utmParameters)) {
            $data['url_tags'] = $this->utmParameters;
        }

        // https://developers.facebook.com/docs/marketing-api/reference/ad-creative#fields
        return $data;
    }

    protected function getLimiterPrefix(): ?string
    {
        $requestName = (new ReflectionClass($this))->getShortName();

        return "ad-account-id-{$this->adAccount->id}:{$requestName}";
    }
}
