<?php

use App\Http\Middleware\EnsureFacebookTokenIsValid;
use App\Jobs\SyncDataFromMeta;
use App\Models\Connection;
use App\Models\User;
use App\Services\Facebook;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Laravel\Socialite\Facades\Socialite;

Route::middleware('guest')->group(function () {
    Route::get('/login', function () {
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

        return $driver->scopes($scopes)->redirect();
    })->name('login');
});

Route::get('/connect/facebook/callback', function () {
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
        SyncDataFromMeta::dispatch($connection);
    }

    Auth::login($user);

    return redirect()->to('/foo');
});

Route::middleware(['auth', EnsureFacebookTokenIsValid::class])->group(function () {
    Route::get('/foo', function () {
        $user = Auth::user();

        return $user->connection->adAccounts()->with('adCampaigns')->get();
    });

    // Will be a POST eventually
    Route::get('/logout', function () {
        Auth::logout();

        return response('OK', 200);
    });

    Route::get('/force-sync', function () {
        // Eventually we will have some "Sync" button in the UI which also has a cooldown -> we can check on $connection->last_synced_at

        $user = Auth::user();

        SyncDataFromMeta::dispatch($user->connection);

        return response('OK', 200);
    });
});
