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

        // https://developers.facebook.com/docs/graph-api/overview/rate-limiting/#ads-management
        // {\"error\":{\"message\":\"(#80004) There have been too many calls to this ad-account. Wait a bit and try again. For more info, please refer to https:\\/\\/developers.facebook.com\\/docs\\/graph-api\\/overview\\/rate-limiting#ads-management.\",\"type\":\"OAuthException\",\"code\":80004,\"error_subcode\":2446079,\"fbtrace_id\":\"AbJqAij9tVzv8550Tr564M2\"}}
        $rateLimitErrorCodes = [4, 17, 32, 613, 80004, 80000, 80003, 80002, 80005, 80006, 32, 80001, 80008, 80014, 80009];

        $isRateLimit = $status === 429
            || ($status === 400 && in_array($errorBody['code'] ?? null, $rateLimitErrorCodes));

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

        Log::warning('[RatelimitException caught] - Meta API rate limit hit.', [
            'status' => $status,
            'retry_after_seconds' => $retryAfter,
            'x_ad_account_usage' => $adAccountUsageHeader,
            'response_body' => $response->body(),
            'error_code' => $errorBody['code'] ?? null,
            'error_subcode' => $errorBody['error_subcode'] ?? null,
            'error_message' => $errorBody['message'] ?? null,
            'headers' => $response->headers()->all(),
        ]);

        $limit->exceeded(releaseInSeconds: $retryAfter);
    }
}
