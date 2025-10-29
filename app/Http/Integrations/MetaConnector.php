<?php

namespace App\Http\Integrations;

use App\Http\Integrations\Requests\Traits\HasMetaRateLimit;
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
    use HasMetaRateLimit;

    protected Connection $connection;

    public function __construct(Connection $connection)
    {
        $this->connection = $connection;

        // Logger
        // $this->middleware()->onResponse(function (Response $response) {
        //     $request = $response->getRequest();

        //     $cached = method_exists($response, 'isCached') && $response->isCached();

        //     Log::info($cached ? 'Saloon (cached) request completed' : 'Saloon (NOT cached) request completed', [
        //         'request' => get_class($request),
        //         'method' => $request->getMethod(),
        //         'url' => $request->resolveEndpoint(),
        //         'status' => $response->status(),
        //         'cached' => $cached,
        //         'body' => $response->body(),
        //         'successful' => $response->successful(),
        //     ]);
        // });
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
                return $response->json('data', []);
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

        Log::debug("[Token renewal]: {$this->connection->id} - Checking if token needs renewal...");

        $expirationBuffer = now()->addDays(7);

        if ($this->connection->expires_at && $this->connection->expires_at->lte($expirationBuffer)) {
            Log::debug("[Token renewal]: {$this->connection->id}'s token needs renewal - renewing...");

            return true;
        }

        Log::debug("[Token renewal]: {$this->connection->id}'s token expiration is outside of expiration buffer - skipping...");

        return false;
    }
}
