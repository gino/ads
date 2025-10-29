<?php

namespace App\Http\Integrations\Requests\Traits;

use App\Http\Integrations\Requests\Exceptions\MetaRateLimitException;
use Illuminate\Support\Facades\Log;
use Saloon\Enums\PipeOrder;
use Saloon\Http\PendingRequest;
use Saloon\Http\Response;

trait HasMetaRateLimit
{
    // https://developers.facebook.com/docs/graph-api/overview/rate-limiting/#ads-management
    protected array $metaRateLimitCodes = [4, 17, 32, 613, 80004, 80000, 80003, 80002, 80005, 80006, 32, 80001, 80008, 80014, 80009];

    public function bootHasMetaRateLimit(PendingRequest $pendingRequest): void
    {
        $pendingRequest->middleware()->onResponse(
            function (Response $response): void {
                $request = $response->getRequest();

                if ($response->isCached()) {
                    Log::debug('[HasMetaRateLimit] No rate limit from Meta - request was cached - ignoring...', [
                        'cached' => $response->isCached(),
                        'request' => get_class($request),
                        'method' => $request->getMethod(),
                        'url' => $request->resolveEndpoint(),
                        'status' => $response->status(),
                        'headers' => $response->headers()->all(),
                    ]);

                    return;
                }

                $status = $response->status();
                $error = $response->json('error') ?? [];

                $isRateLimited =
                    $status === 429 ||
                    ($status === 400 && in_array($error['code'] ?? null, $this->metaRateLimitCodes ?? [], true));

                if (! $isRateLimited) {
                    Log::debug('[HasMetaRateLimit] No rate limit from Meta', [
                        'request' => get_class($request),
                        'method' => $request->getMethod(),
                        'url' => $request->resolveEndpoint(),
                        'status' => $response->status(),
                        'headers' => $response->headers()->all(),
                    ]);

                    return;
                }

                $retryAfterSeconds = null;
                $retryAfterSource = 'default';

                // 1. Check standard Retry-After header
                $retryHeader = $response->header('Retry-After');
                if ($retryHeader !== null) {
                    $retryAfterSeconds = is_numeric($retryHeader)
                        ? (int) $retryHeader
                        : strtotime($retryHeader) - time();

                    if ($retryAfterSeconds > 0) {
                        $retryAfterSource = 'retry-after-header';
                    }
                }

                // 2. Check x-ad-account-usage (Meta Ads rate limit)
                if ($retryAfterSeconds === null || $retryAfterSeconds <= 0) {
                    $adAccountUsageHeader = $response->headers()->get('x-ad-account-usage');
                    if ($adAccountUsageHeader) {
                        $usage = json_decode($adAccountUsageHeader, true);
                        if (json_last_error() === JSON_ERROR_NONE && isset($usage['reset_time_duration'])) {
                            $reset = (int) $usage['reset_time_duration'];
                            if ($reset > 0) {
                                $retryAfterSeconds = $reset;
                                $retryAfterSource = 'x-ad-account-usage.reset_time_duration';
                            }
                        }
                    }
                }

                // 3. Fallback: x-business-use-case-usage (used for business apps)
                if ($retryAfterSeconds === null || $retryAfterSeconds <= 0) {
                    $businessUsageHeader = $response->headers()->get('x-business-use-case-usage');
                    if ($businessUsageHeader) {
                        $usage = json_decode($businessUsageHeader, true);

                        if (json_last_error() === JSON_ERROR_NONE && is_array($usage)) {
                            foreach ($usage as $groupName => $group) {
                                if (is_array($group)) {
                                    foreach ($group as $entry) {
                                        if (isset($entry['estimated_time_to_regain_access'])) {
                                            $minutes = (int) $entry['estimated_time_to_regain_access'];
                                            if ($minutes > 0) {
                                                $retryAfterSeconds = $minutes * 60; // convert to seconds
                                                $retryAfterSource = "x-business-use-case-usage.{$groupName}.estimated_time_to_regain_access";
                                                break 2; // stop searching
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // Default fallback (avoid nulls)
                $retryAfterSeconds ??= 60;
                if ($retryAfterSource === 'default' && $retryAfterSeconds === 60) {
                    $retryAfterSource = 'default-fallback';
                }

                Log::warning('[HasMetaRateLimit] Meta API rate limit encountered', [
                    'retry_after_seconds' => $retryAfterSeconds,
                    'retry_after_source' => $retryAfterSource,
                    'status' => $status,
                    'code' => $error['code'] ?? null,
                    'message' => $error['message'] ?? null,
                    'endpoint' => $request->resolveEndpoint(),
                    'status' => $response->status(),
                    'headers' => $response->headers()->all(),
                    'request' => get_class($request),
                    'method' => $request->getMethod(),
                ]);

                throw new MetaRateLimitException(
                    'Meta API rate limit encountered: '.($error['message'] ?? 'Unknown'),
                    request: $request,
                    response: $response,
                    retryAfterSeconds: $retryAfterSeconds
                );
            },
            order: PipeOrder::LAST
        );
    }
}
