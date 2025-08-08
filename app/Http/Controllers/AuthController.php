<?php

namespace App\Http\Controllers;

use App\Jobs\Meta\Sync;
use App\Jobs\Meta\SyncAdAccounts;
use App\Jobs\Meta\SyncAdCampaigns;
use App\Jobs\Meta\SyncAds;
use App\Jobs\Meta\SyncAdSets;
use App\Models\AdAccount;
use App\Models\Connection;
use App\Models\User;
use App\Services\Facebook;
use App\Services\Paginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function login()
    {
        // https://developers.facebook.com/docs/permissions/
        $scopes = [
            // 'business_management',
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

        /** @var User $user */
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
            Bus::chain([
                new SyncAdAccounts($connection),
                new SyncAdCampaigns($connection),
                new SyncAdSets($connection),
                new SyncAds($connection),
            ])->dispatch();
        } else {
            $this->handleExistingUserPermissions($connection);
        }

        Auth::login($user);

        return to_route('dashboard.index');
    }

    private function handleExistingUserPermissions(Connection $connection)
    {
        // Fetch current ad accounts from Meta
        $paginator = new Paginator(Facebook::client());
        $metaAdAccounts = $paginator->fetchAll('/me/adaccounts', [
            'access_token' => $connection->access_token,
            'fields' => 'id',
            'limit' => 25,
        ]);

        $metaAdAccountIds = collect($metaAdAccounts)->pluck('id')->toArray();

        // Get all existing ad accounts (including soft deleted ones)
        $existingAdAccounts = $connection->adAccounts()
            ->withTrashed()
            ->get()
            ->keyBy('external_id');

        $accountsToSync = collect();
        $hasChanges = false;

        // Process Meta ad accounts
        foreach ($metaAdAccounts as $metaAdAccount) {
            $existingAccount = $existingAdAccounts->get($metaAdAccount['id']);

            if ($existingAccount) {
                // Account exists - restore if soft deleted
                if ($existingAccount->trashed()) {
                    $existingAccount->restore();
                    $accountsToSync->push($existingAccount);
                    $hasChanges = true;

                    Log::info("Restored ad account {$metaAdAccount['id']} for user {$connection->user->id}");
                }
            } else {
                // New account - will be created during sync
                $hasChanges = true;
                Log::info("New ad account {$metaAdAccount['id']} detected for user {$connection->user->id}");
            }
        }

        // Soft delete accounts that are no longer accessible
        $accountsToDelete = $existingAdAccounts->filter(function ($account) use ($metaAdAccountIds) {
            return ! in_array($account->external_id, $metaAdAccountIds) && ! $account->trashed();
        });

        foreach ($accountsToDelete as $account) {
            // Soft delete the account and cascade to related data
            $this->softDeleteAdAccountCascade($account);
            $hasChanges = true;

            Log::info("Soft deleted ad account {$account->external_id} for user {$connection->user->id}");
        }

        // Only run sync jobs if there are changes
        if ($hasChanges) {
            // If we have new accounts or restored accounts, run the full sync chain
            if ($accountsToSync->isNotEmpty() || $existingAdAccounts->count() !== count($metaAdAccountIds)) {
                Bus::chain([
                    new SyncAdAccounts($connection),
                    new SyncAdCampaigns($connection),
                    new SyncAdSets($connection),
                    new SyncAds($connection),
                ])->dispatch();

                Log::info("Dispatched sync jobs for user {$connection->user->id} due to ad account changes");
            }
        }
    }

    private function softDeleteAdAccountCascade(AdAccount $adAccount)
    {
        // Soft delete in reverse dependency order to maintain referential integrity

        // 1. Soft delete ads first
        // $adAccount->ads()->whereNull('deleted_at')->update([
        //     'deleted_at' => now()
        // ]);

        // // 2. Then ad sets
        // $adAccount->adSets()->whereNull('deleted_at')->update([
        //     'deleted_at' => now()
        // ]);

        // // 3. Then campaigns
        // $adAccount->campaigns()->whereNull('deleted_at')->update([
        //     'deleted_at' => now()
        // ]);

        // 4. Finally the ad account itself
        $adAccount->delete();
    }
}
