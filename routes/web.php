<?php

use App\Models\Connection;
use App\Models\User;
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
    $user = Socialite::driver('facebook')->user();

    // Maybe we don't wanna save this at all?
    // Instead we maybe wanna just save the attached ad accounts etc. (need to check)
    $connection = Connection::updateOrCreate([
        'type' => 'facebook',
        'user_id' => User::first()->id, // TODO: Get the user from the session
    ], [
        'access_token' => $user->token,
        'refresh_token' => $user->refreshToken,
        'expires_at' => now()->addSeconds($user->expiresIn),
    ]);

    dd($user);
});
