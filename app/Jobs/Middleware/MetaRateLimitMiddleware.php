<?php

namespace App\Jobs\Middleware;

use App\Http\Integrations\Requests\Exceptions\MetaRateLimitException;
use Closure;

class MetaRateLimitMiddleware
{
    public function handle(object $job, Closure $next): mixed
    {
        try {
            return $next($job);
        } catch (MetaRateLimitException $exception) {
            return null;
            // return $job->release($exception->getLimit()->getRemainingSeconds());
        }
    }
}
