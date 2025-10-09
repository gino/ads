<?php

namespace App\Http\Integrations\Requests;

use App\Http\Integrations\Requests\Inputs\AdSetInput;
use App\Models\AdAccount;
use Saloon\Contracts\Body\HasBody;
use Saloon\Enums\Method;
use Saloon\Http\Request;
use Saloon\Traits\Body\HasJsonBody;

// https://developers.facebook.com/docs/marketing-api/reference/ad-campaign#Creating
// https://developers.facebook.com/docs/marketing-api/get-started/basic-ad-creation/create-an-ad-set

class CreateAdSetsRequest extends Request implements HasBody
{
    use HasJsonBody;

    protected Method $method = Method::POST;

    /**
     * @param  AdSetInput[]  $adSets
     **/
    public function __construct(
        public AdAccount $adAccount,
        public array $adSets,
        public string $campaignId,
        public string $pixelId
    ) {}

    public function resolveEndpoint(): string
    {
        return '';
    }

    protected function defaultBody(): array
    {
        // https://developers.facebook.com/docs/graph-api/batch-requests/#complex-batch-requests

        $mappedAdSets = collect($this->adSets)->map(function ($adSet) {
            return [
                'method' => 'POST',
                'relative_url' => "{$this->adAccount->external_id}/adsets",
                'body' => http_build_query([
                    'name' => $adSet['label'],
                    'status' => 'ACTIVE',
                    'campaign_id' => $this->campaignId,
                    'billing_event' => 'IMPRESSIONS',
                    'bid_strategy' => 'LOWEST_COST_WITHOUT_CAP',
                    'optimization_goal' => 'OFFSITE_CONVERSIONS',
                    'promoted_object' => [
                        'pixel_id' => $this->pixelId,
                        'custom_event_type' => 'PURCHASE',
                    ],
                    'targeting' => [
                        'geo_locations' => [
                            'countries' => $adSet['countries'],
                        ],
                        'genders' => [1, 2],
                        'age_min' => 30,
                        'age_max' => 50,
                        'targeting_automation' => [
                            'advantage_audience' => 0,
                            // 'individual_setting' => [
                            //     'age' => 1,      // 1 = treat as requirement
                            //     'gender' => 1,   // 1 = treat as requirement
                            // ],
                        ],
                    ],
                    // 'targeting' => [
                    //     // 'age_min' => $adSet['minAge'],
                    //     // 'age_max' => $adSet['maxAge'],
                    //     'age_min' => 30,
                    //     'age_max' => 50,
                    //     // 'age_range' => [25, 35],
                    //     'geo_locations' => [
                    //         'countries' => $adSet['countries'],
                    //     ],
                    //     // Sending this payload to the Meta API causes the error
                    //     'targeting_automation' => [
                    //         'advantage_audience' => 0,
                    //         // 'individual_setting' => [
                    //         //     // https://developers.facebook.com/docs/marketing-api/audiences/reference/advanced-targeting/#enable-age-and-gender-suggestions
                    //         //     // Makes age a suggestion
                    //         //     'age' => 0,
                    //         // ],
                    //     ],
                    // ],
                ]),
            ];
        });

        return [
            'batch' => $mappedAdSets->toArray(),
        ];
    }
}
