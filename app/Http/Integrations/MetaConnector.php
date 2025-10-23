<?php

namespace App\Http\Integrations;

use App\Models\Connection;
use Illuminate\Support\Facades\Log;
use Saloon\Http\Auth\TokenAuthenticator;
use Saloon\Http\Connector;
use Saloon\Http\Request;
use Saloon\Http\Response;
use Saloon\PaginationPlugin\Contracts\HasPagination;
use Saloon\PaginationPlugin\CursorPaginator;

class MetaConnector extends Connector implements HasPagination
{
    protected Connection $connection;

    public function __construct(Connection $connection)
    {
        $this->connection = $connection;
        RequestLoggerPlugin::boot($this);
    }

    public function resolveBaseUrl(): string
    {
        return 'https://graph.facebook.com/v23.0';
    }

    protected function defaultQuery(): array
    {
        return [
            'locale' => 'en_US',
        ];
    }

    protected function defaultAuth(): TokenAuthenticator
    {
        return new TokenAuthenticator($this->connection->access_token);
    }

    public function paginate(Request $request): CursorPaginator
    {
        return new class(connector: $this, request: $request) extends CursorPaginator
        {
            protected ?int $perPageLimit = 25;

            protected function getNextCursor(Response $response): int|string
            {
                return $response->json('paging.cursors.after');
            }

            protected function isLastPage(Response $response): bool
            {
                return is_null($response->json('paging.next'));
            }

            protected function getPageItems(Response $response, Request $request): array
            {
                return $response->json('data');
            }

            protected function applyPagination(Request $request): Request
            {
                if ($this->currentResponse instanceof Response) {
                    $request->query()->add('after', $this->getNextCursor($this->currentResponse));
                }

                if (isset($this->perPageLimit)) {
                    $request->query()->add('limit', $this->perPageLimit);
                }

                return $request;
            }
        };
    }

    public function tokenNeedsRenewal()
    {
        if (! $this->connection->access_token) {
            return false;
        }

        Log::debug($this->connection->id.' Checking if token needs renewal');

        $expirationBuffer = now()->addDays(7);

        if ($this->connection->expires_at && $this->connection->expires_at->lte($expirationBuffer)) {
            Log::debug($this->connection->id.' Token needs renewal');

            return true;
        }

        Log::debug($this->connection->id.' Token expiration is outside of expiration buffer - not renewing');

        return false;
    }
}
