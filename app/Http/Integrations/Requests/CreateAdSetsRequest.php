<?php

namespace App\Http\Integrations\Requests;

use App\Http\Integrations\Requests\Data\AdSetInput;
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
        public string $campaignId
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
                    'campaign_id' => $this->campaignId,
                ]),
            ];
        });

        return [
            'batch' => $mappedAdSets->toArray(),
        ];
    }
}
