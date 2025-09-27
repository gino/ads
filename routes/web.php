<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CampaignsController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\ViewController;
use App\Http\Integrations\MetaConnector;
use App\Http\Integrations\Requests\GetPagesRequest;
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

    // Upload
    Route::get('/upload', [UploadController::class, 'index'])->name('dashboard.upload');
    Route::post('/upload/creative', [UploadController::class, 'uploadCreative'])->name('dashboard.upload.creative');
    Route::post('/upload/create-adsets', [UploadController::class, 'createAdSets'])->name('dashboard.upload.create-adsets');

    Route::get('/campaigns', [CampaignsController::class, 'campaigns'])->name('dashboard.campaigns');
    Route::get('/campaigns/adsets', [CampaignsController::class, 'adSets'])->name('dashboard.campaigns.adSets');
    Route::get('/campaigns/ads', [CampaignsController::class, 'ads'])->name('dashboard.campaigns.ads');

    // Updating status routes
    Route::patch('/campaigns/status', [CampaignsController::class, 'updateCampaignStatus'])->name('campaigns.status.update');
    Route::patch('/adsets/status', [CampaignsController::class, 'updateAdSetStatus'])->name('adSets.status.update');
    Route::patch('/ads/status', [CampaignsController::class, 'updateAdStatus'])->name('ads.status.update');

    Route::post('/select-ad-account', [AuthController::class, 'selectAdAccount'])->name('select-ad-account');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::get('/foo', function (Request $request) {
        /** @var AdAccount $adAccount */
        $adAccount = $request->adAccount();

        $meta = new MetaConnector($request->user()->connection);

        $foo = $meta->send(new GetPagesRequest($adAccount));

        return $foo->json();
    });
});
