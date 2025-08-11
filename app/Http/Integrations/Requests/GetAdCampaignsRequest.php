<?php

namespace App\Http\Integrations\Requests;

use App\Models\AdAccount;
use Saloon\Enums\Method;
use Saloon\Http\Request;
use Saloon\PaginationPlugin\Contracts\Paginatable;

// https://github.com/gino/ads/blob/main/app/Jobs/Meta/SyncAdCampaigns.php

class GetAdCampaignsRequest extends Request implements Paginatable
{
    protected Method $method = Method::GET;

    protected AdAccount $adAccount;

    public function __construct(AdAccount $adAccount)
    {
        $this->adAccount = $adAccount;
    }

    public function resolveEndpoint(): string
    {
        return "{$this->adAccount->external_id}/campaigns";
    }

    protected function defaultQuery(): array
    {
        // https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group

        $fields = [
            'id',
            'name',
            'status',
        ];

        return [
            'fields' => implode(',', $fields),
            'date_preset' => 'maximum',
        ];
    }
}
