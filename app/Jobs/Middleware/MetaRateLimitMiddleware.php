<?php

namespace App\Jobs\Middleware;

use App\Http\Integrations\Requests\Exceptions\MetaRateLimitException;
use Closure;
use Illuminate\Support\Facades\Log;

class MetaRateLimitMiddleware
{
    public function handle(object $job, Closure $next): mixed
    {
        try {
            return $next($job);
        } catch (MetaRateLimitException $exception) {
            $response = $exception->getResponse();
            $request = $exception->getRequest();

            $retryAfterSeconds = $exception->getRetryAfterSeconds();

            Log::warning('[MetaRateLimitMiddleware] Job hit Meta API rate limit — releasing back to queue', [
                'job' => get_class($job),
                'retry_after_seconds' => $retryAfterSeconds,
                'request' => $request?->resolveEndpoint(),
                'status' => $response?->status(),
                'code' => $response?->json('error.code') ?? null,
                'message' => $response?->json('error.message') ?? $exception->getMessage(),
            ]);

            return $job->release($retryAfterSeconds);
        }
    }
}
