<?php

namespace App\Http\Middleware;

use App\Services\Facebook;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureFacebookTokenIsValid
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

        if (Facebook::needsRenewal($user->connection)) {
            Facebook::renewToken($user->connection);
        }

        return $next($request);
    }
}
