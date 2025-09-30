<?php

namespace App\Http\Integrations\Requests;

use App\Models\AdAccount;
use Saloon\Contracts\Body\HasBody;
use Saloon\Enums\Method;
use Saloon\Http\Request;
use Saloon\Traits\Body\HasJsonBody;

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
        // https://developers.facebook.com/docs/marketing-api/reference/ad-creative#Creating
        // https://chatgpt.com/c/68dadcc5-64c4-832a-a647-4f5ec1736a32
        return [
            'name' => $this->name,
            'object_story_spec' => [],
        ];
    }
}
