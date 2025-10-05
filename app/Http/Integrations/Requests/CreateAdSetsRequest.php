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
                    'optimization_goal' => 'OFFSITE_CONVERSIONS',
                    'promoted_object' => [
                        'pixel_id' => $this->pixelId,
                        'custom_event_type' => 'PURCHASE',
                    ],
                    // {"error":{"message":"Invalid parameter","type":"OAuthException","code":100,"error_subcode":1870227,"is_transient":false,"error_user_title":"Advantage Audience Flag Required","error_user_msg":"To create your ad set, you need to enable or disable the Advantage audience feature. This can be done by setting the advantage_audience flag to either 1 or 0 within the targeting_automation field in the targeting spec.","fbtrace_id":"Aj_qFE-Sva-Dbh1RtbvP16X"}}
                    // {"error":{"message":"Invalid parameter","type":"OAuthException","code":100,"error_subcode":1870189,"is_transient":false,"error_user_title":"Maximum age is below threshold","error_user_msg":"With ad sets that use Advantage+ audience, the maximum age audience control can\u2019t be set to lower than 65. You can add a lower maximum age as a suggestion instead when creating or editing an ad set in Ads Manager.","fbtrace_id":"AMPG7tV8JtFT3JIACsyiRDV"}}
                    // {"error":{"message":"Invalid parameter","type":"OAuthException","code":100,"error_subcode":1870197,"is_transient":false,"error_user_title":"The targeting_optimization field has been removed","error_user_msg":"You don\u2019t need to set a value for the targeting_optimization field because it has been removed. Advantage detailed targeting will be applied to your ad set.","fbtrace_id":"AMKyAhxIp0-e7hrnCCblQlu"}}
                    'targeting' => [
                        'age_min' => $adSet['minAge'],
                        'age_max' => $adSet['maxAge'],
                        'geo_locations' => [
                            'countries' => $adSet['countries'],
                        ],
                        'targeting_automation' => [
                            'advantage_audience' => 0,
                        ],
                    ],
                ]),
            ];
        });

        return [
            'batch' => $mappedAdSets->toArray(),
        ];
    }
}
