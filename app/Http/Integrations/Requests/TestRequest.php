<?php

namespace App\Http\Integrations\Requests;

use App\Models\AdAccount;
use Saloon\Enums\Method;
use Saloon\Http\Request;

// https://github.com/gino/ads/blob/main/app/Jobs/Meta/SyncAds.php

class TestRequest extends Request
{
    protected Method $method = Method::GET;

    protected AdAccount $adAccount;

    public function __construct(AdAccount $adAccount)
    {
        $this->adAccount = $adAccount;
    }

    public function resolveEndpoint(): string
    {
        return '/1377905993437055';
    }

    protected function defaultQuery(): array
    {
        // https://developers.facebook.com/docs/marketing-api/reference/adgroup/#fields

        $fields = [
            'id',
            // 'creative',
            'degrees_of_freedom_spec',
        ];

        return [
            'fields' => implode(',', $fields),
        ];
    }
}
