<?php

namespace App\Http\Controllers;

use App\Jobs\Meta\Sync;
use App\Models\Connection;
use App\Models\User;
use App\Services\Facebook;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function login()
    {
        // https://developers.facebook.com/docs/permissions/
        $scopes = [
            'business_management',
            'pages_show_list',
            'pages_read_engagement',
            'ads_management',
            'ads_read',
        ];

        /** @var Socialite $driver */
        $driver = Socialite::driver('facebook');

        $redirect = $driver->scopes($scopes)->redirect();

        return Inertia::location($redirect->getTargetUrl());
    }

    public function logout()
    {
        Auth::logout();

        return to_route('login');
    }

    public function callback()
    {
        $data = Socialite::driver('facebook')->user();

        $user = User::firstOrCreate(
            ['email' => $data->email],
            [
                'account_id' => $data->id,
                'name' => $data->name,
                'avatar' => $data->avatar,
            ]
        );

        $connection = Connection::updateOrCreate([
            'user_id' => $user->id,
        ], [
            'access_token' => $data->token,
            'refresh_token' => $data->refreshToken,
            'expires_at' => now()->addSeconds($data->expiresIn),
        ]);

        // Exchange short-lived token for a long-lived one
        Facebook::renewToken($connection);

        if ($user->wasRecentlyCreated) {
            // Sync data if the user has just been created (so we have the latest data on our end, from Meta)
            Sync::dispatch($connection);
        }

        Auth::login($user);

        return to_route('dashboard.index');
    }
}
