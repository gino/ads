<?php

namespace App\Http\Controllers;

use App\Http\Integrations\MetaConnector;
use App\Http\Integrations\Requests\GetAdAccountsRequest;
use App\Http\Integrations\Requests\RenewTokenRequest;
use App\Models\AdAccount;
use App\Models\AdAccountSetting;
use App\Models\Connection;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function login()
    {
        // https://developers.facebook.com/docs/permissions/
        $scopes = [
            'instagram_basic',
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

    public function reauthenticate()
    {
        Redirect::setIntendedUrl('/settings/ad-accounts');

        return $this->login();
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

        if (! $user->wasRecentlyCreated) {
            $user->update(['avatar' => $data->avatar]);
        }

        $connection = Connection::updateOrCreate([
            'user_id' => $user->id,
        ], [
            'access_token' => $data->token,
            'refresh_token' => $data->refreshToken,
            'expires_at' => now()->addSeconds($data->expiresIn),
        ]);

        // Exchange short-lived token for a long-lived one
        $this->exchangeLongLivedToken($connection);

        // Maybe we wanna off load this request to a queue job so we can show some type of pending/loading state in the UI
        $adAccounts = $this->fetchAdAccounts($connection);

        AdAccount::upsert($adAccounts->map(function ($adAccount) use ($connection) {
            return [
                'external_id' => $adAccount['id'],
                'name' => $adAccount['name'],
                'currency' => $adAccount['currency'],
                'status' => $adAccount['account_status'],
                'connection_id' => $connection->id,
                'business_id' => $adAccount['business']['id'] ?? null,
                'timezone' => $adAccount['timezone_name'],
                'timezone_offset_utc' => $adAccount['timezone_offset_hours_utc'],
                'permissions' => json_encode($adAccount['user_tasks'] ?? []),
            ];
        })->all(), uniqueBy: ['external_id'], update: [
            'name',
            'currency',
            'status',
            'business_id',
            'timezone',
            'timezone_offset_utc',
            'permissions',
        ]);

        $ids = AdAccount::whereIn('external_id', array_column($adAccounts->all(), 'id'))->pluck('id', 'external_id');

        $settings = [];
        foreach ($adAccounts->all() as $adAccount) {
            $adAccountId = $ids[$adAccount['id']];

            if (isset($adAccount['default_dsa_payor'])) {
                $settings[] = [
                    'key' => 'default_dsa_payor',
                    'value' => json_encode($adAccount['default_dsa_payor']),
                    'ad_account_id' => $adAccountId,
                ];
            }

            if (isset($adAccount['default_dsa_beneficiary'])) {
                $settings[] = [
                    'key' => 'default_dsa_beneficiary',
                    'value' => json_encode($adAccount['default_dsa_beneficiary']),
                    'ad_account_id' => $adAccountId,
                ];
            }
        }
        AdAccountSetting::upsert(
            $settings,
            ['ad_account_id', 'key'],
            ['value', 'updated_at']
        );

        Auth::login($user);

        return redirect()->intended(route('dashboard.index'));
    }

    private function exchangeLongLivedToken(Connection $connection)
    {
        $meta = new MetaConnector($connection);

        $response = $meta->send(new RenewTokenRequest($connection));
        $data = $response->json();

        $connection->update([
            'access_token' => $data['access_token'],
            'expires_at' => isset($data['expires_in']) ? now()->addSeconds($data['expires_in']) : now()->addDays(60),
            'renewed_at' => now(),
        ]);
    }

    private function fetchAdAccounts(Connection $connection)
    {
        $meta = new MetaConnector($connection);
        $paginator = $meta->paginate(new GetAdAccountsRequest);

        return $paginator->collect();
    }

    public function selectAdAccount(Request $request)
    {
        $validated = $request->validate([
            'ad_account_id' => 'required',
        ]);

        $request->session()->put('selected_ad_account_id', $validated['ad_account_id']);
        $request->user()->update(['last_selected_ad_account_id' => $validated['ad_account_id']]);

        // This one preserves query params, not sure if we want that:
        // return redirect()->back();

        $previous = url()->previous(); // e.g. https://yourapp.com/campaigns?from=...
        $path = parse_url($previous, PHP_URL_PATH); // gives "/campaigns"

        return redirect($path);
    }
}
