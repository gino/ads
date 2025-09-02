<?php

namespace App\Http\Integrations\Requests;

use Saloon\Contracts\Body\HasBody;
use Saloon\Enums\Method;
use Saloon\Http\Request;
use Saloon\Traits\Body\HasJsonBody;

class UpdateAdStatusRequest extends Request implements HasBody
{
    use HasJsonBody;

    protected Method $method = Method::POST;

    protected string $id;

    protected string $status;

    public function __construct(string $id, string $status)
    {
        $this->id = $id;
        $this->status = $status;
    }

    public function resolveEndpoint(): string
    {
        return "{$this->id}";
    }

    protected function defaultBody(): array
    {
        // https://developers.facebook.com/docs/marketing-api/reference/adgroup/#Updating

        return [
            'status' => $this->status,
        ];
    }
}
