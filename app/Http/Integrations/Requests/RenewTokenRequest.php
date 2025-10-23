<?php

namespace App\Http\Integrations\Requests;

use App\Http\Integrations\Requests\Traits\HasRateLimits;
use App\Models\Connection;
use ReflectionClass;
use Saloon\Enums\Method;
use Saloon\Http\Request;

class RenewTokenRequest extends Request
{
    use HasRateLimits;

    protected Method $method = Method::GET;

    protected Connection $connection;

    public function __construct(Connection $connection)
    {
        $this->connection = $connection;
    }

    public function resolveEndpoint(): string
    {
        return '/oauth/access_token';
    }

    protected function defaultQuery(): array
    {
        return [
            'grant_type' => 'fb_exchange_token',
            'client_id' => config('services.facebook.client_id'),
            'client_secret' => config('services.facebook.client_secret'),
            'fb_exchange_token' => $this->connection->access_token,
        ];
    }

    protected function getLimiterPrefix(): ?string
    {
        $requestName = (new ReflectionClass($this))->getShortName();

        return "connection-id-{$this->connection->id}:{$requestName}";
    }
}
