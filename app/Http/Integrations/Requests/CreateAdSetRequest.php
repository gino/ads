<?php

namespace App\Http\Integrations\Requests;

use App\Http\Integrations\Requests\Inputs\AdSetInput;
use App\Models\AdAccount;
use Saloon\Contracts\Body\HasBody;
use Saloon\Enums\Method;
use Saloon\Http\Request;
use Saloon\Traits\Body\HasJsonBody;

class CreateAdSetRequest extends Request implements HasBody
{
    use HasJsonBody;

    protected Method $method = Method::POST;

    public function __construct(
        public AdAccount $adAccount,
        public AdSetInput $adSet,
        public string $campaignId,
        public string $pixelId
    ) {}

    public function resolveEndpoint(): string
    {
        return "{$this->adAccount->external_id}/adsets";
    }

    protected function defaultBody(): array
    {
        // https://developers.facebook.com/docs/marketing-api/reference/ad-campaign/
        // https://developers.facebook.com/docs/marketing-api/reference/ad-campaign/#Creating

        $genders = match ($this->adSet->gender) {
            'men' => [1],
            'women' => [2],
            default => [1, 2],
        };

        return [
            'name' => $this->adSet->label,
            'status' => 'ACTIVE',
            'campaign_id' => $this->campaignId,
            'billing_event' => 'IMPRESSIONS',
            'optimization_goal' => 'OFFSITE_CONVERSIONS',
            'bid_strategy' => 'LOWEST_COST_WITHOUT_CAP',
            // https://developers.facebook.com/docs/marketing-api/reference/ad-campaign/#Creating
            'start_time' => $this->adSet->startDate,
            'promoted_object' => [
                'pixel_id' => $this->pixelId,
                'custom_event_type' => 'PURCHASE',
            ],
            'targeting' => [
                'geo_locations' => [
                    'countries' => $this->adSet->countries,
                ],
                'genders' => $genders,
                'age_min' => $this->adSet->minAge,
                'age_max' => $this->adSet->maxAge,
                'targeting_automation' => [
                    'advantage_audience' => 0,
                ],
            ],
        ];
    }
}
