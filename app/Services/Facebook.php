<?php

namespace App\Services;

use App\Models\Connection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class Facebook
{
    public static function client()
    {
        return Http::baseUrl('https://graph.facebook.com/v23.0');
    }

    public static function renewToken(Connection $connection)
    {
        Log::debug("[$connection->id] Renewing token...");

        $response = self::client()->get('/oauth/access_token', [
            'grant_type' => 'fb_exchange_token',
            'client_id' => config('services.facebook.client_id'),
            'client_secret' => config('services.facebook.client_secret'),
            'fb_exchange_token' => $connection->access_token,
        ]);

        if ($response->failed()) {
            Log::error("Failed to renew token ({$connection->id}): ".$response->body());

            return false;
        }

        $data = $response->json();

        Log::debug("[$connection->id] Renewed token");

        $connection->update([
            'access_token' => $data['access_token'],
            'expires_at' => isset($data['expires_in']) ? now()->addSeconds($data['expires_in']) : now()->addDays(60),
            'renewed_at' => now(),
        ]);

        return $connection;
    }

    public static function needsRenewal(Connection $connection)
    {
        if (! $connection->access_token) {
            return false;
        }

        Log::debug("[$connection->id] Checking if token needs renewal");

        $expirationBuffer = now()->addDays(7);

        if ($connection->expires_at && $connection->expires_at->lte($expirationBuffer)) {
            Log::debug("[$connection->id] Token needs renewal");

            return true;
        }

        Log::debug("[$connection->id] Token expiration is outside of expiration buffer - not renewing");

        return false;
    }

    public static function getAdAccounts(Connection $connection)
    {
        // Return from our database
        return [];
    }
}
