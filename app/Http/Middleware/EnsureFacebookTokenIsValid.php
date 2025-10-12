<?php

namespace App\Http\Middleware;

use App\Http\Integrations\MetaConnector;
use App\Http\Integrations\Requests\RenewTokenRequest;
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

        $connection = $user->connection;
        $meta = new MetaConnector($user->connection);

        if ($meta->tokenNeedsRenewal()) {
            $response = $meta->send(new RenewTokenRequest($connection));

            $data = $response->json();

            $connection->update([
                'access_token' => $data['access_token'],
                'expires_at' => isset($data['expires_in']) ? now()->addSeconds($data['expires_in']) : now()->addDays(60),
                'renewed_at' => now(),
            ]);
        }

        return $next($request);
    }
}
