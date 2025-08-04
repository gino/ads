<?php

use App\Models\Connection;
use App\Models\User;
use App\Services\Facebook;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Laravel\Socialite\Facades\Socialite;

Route::get('/', function () {
    // https://developers.facebook.com/docs/permissions/
    $scopes = ['business_management', 'pages_show_list', 'pages_read_engagement', 'ads_management', 'ads_read'];

    /** @var Socialite $driver */
    $driver = Socialite::driver('facebook');

    return $driver->scopes($scopes)->redirect();
});

Route::get('/connect/facebook/callback', function () {
    $data = Socialite::driver('facebook')->user();

    $user = User::firstOrCreate(
        ['email' => $data->email],
        ['name' => $data->name]
    );

    $connection = Connection::updateOrCreate([
        'type' => 'facebook',
        'user_id' => $user->id,
    ], [
        'access_token' => $data->token,
        'refresh_token' => $data->refreshToken,
        'expires_at' => now()->addSeconds($data->expiresIn),
    ]);

    // Exchange short-lived token for a long-lived one
    Facebook::renewToken($connection);

    // We wanna call some sync function so we have all known data on our end:
    // - Ad accounts
    // - Campaigns / ad sets / ads

    Auth::login($user);

    // dd($data);
    return redirect()->to('/foo');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/foo', function () {
        $user = Auth::user();

        $adAccounts = (Facebook::getAdAccounts($user->connection));

        return $adAccounts;

        return $user;
    });
});
