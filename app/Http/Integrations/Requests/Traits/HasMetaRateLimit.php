<?php

namespace App\Http\Integrations\Requests\Traits;

use App\Http\Integrations\Requests\Exceptions\MetaRateLimitException;
use Illuminate\Support\Facades\Log;
use Saloon\Enums\PipeOrder;
use Saloon\Http\PendingRequest;
use Saloon\Http\Response;

trait HasMetaRateLimit
{
    protected array $metaRateLimitCodes = [4, 17, 32, 613, 80004, 80000, 80003, 80002, 80005, 80006, 32, 80001, 80008, 80014, 80009];

    public function bootHasMetaRateLimit(PendingRequest $pendingRequest): void
    {
        $pendingRequest->middleware()->onResponse(
            function (Response $response): void {
                $request = $response->getRequest();

                if ($response->isCached()) {
                    Log::debug('No rate limit from Meta - request was cached - ignoring...', [
                        'cached' => $response->isCached(),
                        'request' => get_class($request),
                        'method' => $request->getMethod(),
                        'url' => $request->resolveEndpoint(),
                        'status' => $response->status(),
                    ]);

                    return;
                }

                $status = $response->status();
                $error = $response->json('error') ?? [];

                $isRateLimited =
                    $status === 429 ||
                    ($status === 400 && in_array($error['code'] ?? null, $this->metaRateLimitCodes ?? [], true));

                if ($isRateLimited) {
                    Log::warning('Meta API rate limit encountered', [
                        'status' => $status,
                        'code' => $error['code'] ?? null,
                        'message' => $error['message'] ?? null,
                        'endpoint' => $request->resolveEndpoint(),
                        'status' => $response->status(),
                        'request' => get_class($request),
                        'method' => $request->getMethod(),
                    ]);

                    throw new MetaRateLimitException(
                        'Meta API rate limit encountered: '.($error['message'] ?? 'Unknown'),
                        $request,
                        $response
                    );
                } else {
                    Log::debug('No rate limit from Meta', [
                        'request' => get_class($request),
                        'method' => $request->getMethod(),
                        'url' => $request->resolveEndpoint(),
                        'status' => $response->status(),
                    ]);
                }
            },
            order: PipeOrder::LAST
        );
    }
}

// We wanna do something with the retry after stuff (probably only for the job middleware):
// public static function handle(Response $response, Limit $limit): void
//     {
//         $status = $response->status();

//         $retryAfter = RetryAfterHelper::parse($response->header('Retry-After'));

//         $errorBody = $response->json('error') ?? [];

//         // https://developers.facebook.com/docs/graph-api/overview/rate-limiting/#ads-management
//         // {\"error\":{\"message\":\"(#80004) There have been too many calls to this ad-account. Wait a bit and try again. For more info, please refer to https:\\/\\/developers.facebook.com\\/docs\\/graph-api\\/overview\\/rate-limiting#ads-management.\",\"type\":\"OAuthException\",\"code\":80004,\"error_subcode\":2446079,\"fbtrace_id\":\"AbJqAij9tVzv8550Tr564M2\"}}
//         $rateLimitErrorCodes = [4, 17, 32, 613, 80004, 80000, 80003, 80002, 80005, 80006, 32, 80001, 80008, 80014, 80009];

//         $isRateLimit = $status === 429
//             || ($status === 400 && in_array($errorBody['code'] ?? null, $rateLimitErrorCodes));

//         if (! $isRateLimit) {
//             return;
//         }

//         $adAccountUsageHeader = $response->headers()->get('x-ad-account-usage');
//         if ($retryAfter === null && $adAccountUsageHeader !== null) {
//             $usage = json_decode($adAccountUsageHeader, true);

//             if (
//                 json_last_error() === JSON_ERROR_NONE &&
//                 isset($usage['reset_time_duration'])
//             ) {
//                 $reset = (int) $usage['reset_time_duration'];
//                 if ($reset > 0) {
//                     $retryAfter = $reset;
//                 }
//             }
//         }

//         // Fallback if no valid duration provided
//         if ($retryAfter === null || $retryAfter <= 0) {
//             $retryAfter = 60; // Default wait (1 minute)
//         }

//         Log::warning('[RatelimitException caught] - Meta API rate limit hit.', [
//             'status' => $status,
//             'retry_after_seconds' => $retryAfter,
//             'x_ad_account_usage' => $adAccountUsageHeader,
//             'response_body' => $response->body(),
//             'error_code' => $errorBody['code'] ?? null,
//             'error_subcode' => $errorBody['error_subcode'] ?? null,
//             'error_message' => $errorBody['message'] ?? null,
//             'headers' => $response->headers()->all(),
//         ]);

//         $limit->exceeded(releaseInSeconds: $retryAfter);
//     }
