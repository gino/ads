<?php

namespace App\Services;

use App\Models\Connection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class Facebook
{
    private static function client()
    {
        return Http::baseUrl('https://graph.facebook.com/v23.0');
    }

    public static function renewToken(Connection $connection)
    {
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

        $connection->update([
            'access_token' => $data['access_token'],
            'expires_at' => now()->addSeconds($data['expires_in']),
            'renewed_at' => now(),
        ]);
    }

    public static function needsRenewal(Connection $connection)
    {
        if (! $connection->access_token) {
            return false;
        }

        $expirationBuffer = now()->addDays(7);

        if ($connection->expires_at && $connection->expires_at->lte($expirationBuffer)) {
            return true;
        }

        return false;
    }

    public static function getAdAccounts(Connection $connection)
    {
        $fields = [
            'account_id',
            'name',
            'account_status',
            'currency',
            'business',
            'owner',
        ];

        $response = self::client()->get('/me/adaccounts', [
            'access_token' => $connection->access_token,
            'fields' => implode(',', $fields),
        ]);

        return $response->json();
    }
}
