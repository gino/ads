<?php

namespace App\Http\Integrations;

use App\Models\Connection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Saloon\Http\Auth\TokenAuthenticator;
use Saloon\Http\Connector;
use Saloon\Http\Request;
use Saloon\Http\Response;
use Saloon\PaginationPlugin\Contracts\HasPagination;
use Saloon\PaginationPlugin\CursorPaginator;
use Saloon\RateLimitPlugin\Contracts\RateLimitStore;
use Saloon\RateLimitPlugin\Helpers\RetryAfterHelper;
use Saloon\RateLimitPlugin\Limit;
use Saloon\RateLimitPlugin\Stores\LaravelCacheStore;
use Saloon\RateLimitPlugin\Traits\HasRateLimits;

class MetaConnector extends Connector implements HasPagination
{
    use HasRateLimits;

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

        // Log::debug($this->connection->id.' Checking if token needs renewal');

        $expirationBuffer = now()->addDays(7);

        if ($this->connection->expires_at && $this->connection->expires_at->lte($expirationBuffer)) {
            Log::debug($this->connection->id.' Token needs renewal');

            return true;
        }

        // Log::debug($this->connection->id.' Token expiration is outside of expiration buffer - not renewing');

        return false;
    }

    protected function resolveLimits(): array
    {
        return [];
    }

    protected function resolveRateLimitStore(): RateLimitStore
    {
        return new LaravelCacheStore(Cache::store('redis'));
    }

    protected function handleTooManyAttempts(Response $response, Limit $limit): void
    {
        $status = $response->status();
        $retryAfter = RetryAfterHelper::parse($response->header('Retry-After'));

        $errorBody = $response->json('error') ?? [];

        $isRateLimit = $status === 429
            || ($status === 400 && in_array($errorBody['code'] ?? null, [4, 17, 32]));

        if (! $isRateLimit) {
            return;
        }

        $adAccountUsageHeader = $response->headers()->get('x-ad-account-usage');
        if ($retryAfter === null && $adAccountUsageHeader !== null) {
            $usage = json_decode($adAccountUsageHeader, true);

            if (
                json_last_error() === JSON_ERROR_NONE &&
                isset($usage['reset_time_duration'])
            ) {
                $reset = (int) $usage['reset_time_duration'];
                if ($reset > 0) {
                    $retryAfter = $reset;
                }
            }
        }

        // Fallback if no valid duration provided
        if ($retryAfter === null || $retryAfter <= 0) {
            $retryAfter = 60; // Default wait (1 minute)
        }

        Log::warning('Meta API rate limit hit.', [
            'status' => $status,
            'retry_after_seconds' => $retryAfter,
            'x_ad_account_usage' => $adAccountUsageHeader,
            'response_body' => $response->body(),
            'error_code' => $errorBody['code'] ?? null,
            'error_subcode' => $errorBody['error_subcode'] ?? null,
            'error_message' => $errorBody['message'] ?? null,
        ]);

        $limit->exceeded(releaseInSeconds: $retryAfter);
    }
}
