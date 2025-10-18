<?php

namespace App\Http\Controllers;

use App\Http\Integrations\MetaConnector;
use App\Http\Integrations\Requests\GetAdAccountsRequest;
use App\Http\Integrations\Requests\RenewTokenRequest;
use App\Models\AdAccount;
use App\Models\Connection;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
        AdAccount::upsert($adAccounts, uniqueBy: ['external_id'], update: [
            'name',
            'currency',
            'status',
            'business_id',
            'timezone',
            'timezone_offset_utc',
        ]);

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

        // dd($paginator->collect()->all());

        return $paginator->collect()->map(function ($entry) use ($connection) {
            return [
                'external_id' => $entry['id'],
                'name' => $entry['name'],
                'currency' => $entry['currency'],
                'status' => $entry['account_status'],
                'connection_id' => $connection->id,
                'business_id' => $entry['business']['id'] ?? null,
                'timezone' => $entry['timezone_name'],
                'timezone_offset_utc' => $entry['timezone_offset_hours_utc'],
            ];
        })->all();
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
