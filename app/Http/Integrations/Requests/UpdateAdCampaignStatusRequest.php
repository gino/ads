<?php

namespace App\Http\Integrations\Requests;

use App\Http\Integrations\Requests\Traits\HasRateLimits;
use Saloon\Contracts\Body\HasBody;
use Saloon\Enums\Method;
use Saloon\Http\Request;
use Saloon\Traits\Body\HasJsonBody;

class UpdateAdCampaignStatusRequest extends Request implements HasBody
{
    use HasJsonBody, HasRateLimits;

    protected Method $method = Method::POST;

    protected array $entries;

    public function __construct(array $entries)
    {
        $this->entries = $entries;
    }

    public function resolveEndpoint(): string
    {
        return '';
    }

    protected function defaultBody(): array
    {
        // https://developers.facebook.com/docs/graph-api/batch-requests/#complex-batch-requests

        $mappedEntries = collect($this->entries)->map(function ($entry) {
            return [
                'method' => 'POST',
                'relative_url' => $entry['id'],
                'body' => "status={$entry['status']}",
            ];
        });

        return [
            'batch' => $mappedEntries->toArray(),
        ];
    }
}
