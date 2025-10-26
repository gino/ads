<?php

namespace App\Http\Middleware;

use App\Services\AdAccountService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class HandleAdAccountChanges
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            // This should never happen since this middleware needs to be used together with the 'auth' middleware
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $connection = $user->connection;

        $cacheKey = "ad_accounts_synced_{$connection->id}";

        if (Cache::has($cacheKey)) {
            Log::debug("[Ad account sync]: {$connection->id} still in cache - skipping sync");

            return $next($request);
        }

        Log::debug("[Ad account sync]: {$connection->id} not in cache - syncing data to our end...");

        $adAccounts = AdAccountService::fetchAdAccounts($connection);
        AdAccountService::syncAdAccounts($adAccounts, $connection);
        Cache::put($cacheKey, true, now()->addHours(1));

        return $next($request);
    }
}
