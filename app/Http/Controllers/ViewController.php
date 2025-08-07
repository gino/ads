<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ViewController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        return Inertia::render('index', [
            'adCampaigns' => Inertia::defer(function () use ($user, $request) {
                return $user->connection->adAccounts
                    ->where('id', $request->session()->get('selected_ad_account_id'))
                    ->first()
                    ->adCampaigns()
                    ->with('adSets.ads')
                    ->get();
            }),
        ]);
    }

    public function login()
    {
        return Inertia::render('login');
    }

    public function settingUp(Request $request)
    {
        $user = $request->user();
        $connection = $user->connection;

        if (! empty($connection->last_synced->toArray())) {
            return to_route('dashboard.index');
        }

        return Inertia::render('setup/loading');
    }
}
