<?php

namespace App\Http\Integrations\Requests\Helpers;

use Illuminate\Support\Facades\Log;
use Saloon\Http\Response;
use Saloon\RateLimitPlugin\Helpers\RetryAfterHelper;
use Saloon\RateLimitPlugin\Limit;

class HandleTooManyAttempts
{
    public static function handle(Response $response, Limit $limit): void
    {
        $status = $response->status();

        $retryAfter = RetryAfterHelper::parse($response->header('Retry-After'));

        $errorBody = $response->json('error') ?? [];

        $isRateLimit = $status === 429
            || ($status === 400 && in_array($errorBody['code'] ?? null, [4, 17, 32]));

        Log::debug('is rate limit?', [
            'is_rate_limit' => $isRateLimit,
        ]);

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
