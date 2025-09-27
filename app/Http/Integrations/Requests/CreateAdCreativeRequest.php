<?php

namespace App\Http\Integrations\Requests;

use App\Models\AdAccount;
use Saloon\Contracts\Body\HasBody;
use Saloon\Enums\Method;
use Saloon\Http\Request;
use Saloon\Traits\Body\HasJsonBody;

// https://developers.facebook.com/docs/marketing-api/reference/ad-creative#Creating

class CreateAdCreativeRequest extends Request implements HasBody
{
    use HasJsonBody;

    protected Method $method = Method::POST;

    public function __construct(
        public AdAccount $adAccount,
        public string $name,
        public string $hash,
    ) {}

    public function resolveEndpoint(): string
    {
        return "{$this->adAccount->external_id}/adcreatives";
    }

    protected function defaultBody(): array
    {
        return [
            'name' => $this->name,
            'object_story_spec' => [],
        ];
    }
}
