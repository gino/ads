<?php

namespace App\Http\Integrations\Requests;

use App\Http\Integrations\Requests\Traits\HasRateLimits;
use App\Models\AdAccount;
use ReflectionClass;
use Saloon\Contracts\Body\HasBody;
use Saloon\Enums\Method;
use Saloon\Http\Request;
use Saloon\Traits\Body\HasJsonBody;

// https://developers.facebook.com/docs/marketing-api/reference/adgroup#syncadcreation

class CreateAdRequest extends Request implements HasBody
{
    use HasJsonBody, HasRateLimits;

    protected Method $method = Method::POST;

    public function __construct(
        public AdAccount $adAccount,
        public string $name,
        public string $adSetId,
        public string $creativeId,
        //
        public bool $pausedByDefault
    ) {}

    public function resolveEndpoint(): string
    {
        return "{$this->adAccount->external_id}/ads";
    }

    protected function defaultBody(): array
    {
        return [
            'name' => $this->name,
            'adset_id' => $this->adSetId,
            'creative' => [
                'creative_id' => $this->creativeId,
            ],
            'status' => $this->pausedByDefault ? 'PAUSED' : 'ACTIVE',
        ];
    }

    protected function getLimiterPrefix(): ?string
    {
        $requestName = (new ReflectionClass($this))->getShortName();

        return "ad-account-id-{$this->adAccount->id}:{$requestName}";
    }
}
