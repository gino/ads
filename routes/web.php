<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ViewController;
use App\Http\Middleware\EnsureFacebookTokenIsValid;
use App\Http\Middleware\HandleSelectedAdAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// https://developers.facebook.com/docs/marketing-api/get-started/basic-ad-creation

Route::middleware('guest')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/login', [ViewController::class, 'login'])->name('login');
});

Route::get('/connect/facebook/callback', [AuthController::class, 'callback']);

Route::middleware([
    'auth',
    EnsureFacebookTokenIsValid::class,
    HandleSelectedAdAccount::class,
])->group(function () {
    Route::get('/', [ViewController::class, 'index'])->name('dashboard.index');

    Route::post('/select-ad-account', function (Request $request) {
        $request->session()->put('selected_ad_account_id', $request->input('ad_account_id'));

        return response(null, 200);
    });

    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
});
