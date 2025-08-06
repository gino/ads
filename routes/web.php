<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\SyncController;
use App\Http\Middleware\EnsureFacebookTokenIsValid;
use App\SyncType;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

// https://developers.facebook.com/docs/marketing-api/get-started/basic-ad-creation

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'login'])->name('login');
});

Route::get('/connect/facebook/callback', [AuthController::class, 'callback']);

Route::middleware(['auth', EnsureFacebookTokenIsValid::class])->group(function () {
    Route::get('/foo', function () {
        $user = Auth::user();

        return $user;
    });

    // Will be a POST eventually
    Route::get('/logout', [AuthController::class, 'logout']);

    Route::get('/force-sync/{type?}', [SyncController::class, 'sync'])->whereIn('type', array_map(fn ($e) => $e->value, SyncType::cases()));
});
