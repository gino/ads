<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ViewController extends Controller
{
    public function index(Request $request)
    {
        $adCampaigns = $request->user()->connection->adAccounts->where('id', $request->session()->get('selected_ad_account_id'))->first()->adCampaigns()->with('adSets.ads')->get();

        return Inertia::render('index', [
            'adCampaigns' => $adCampaigns,
        ]);
    }

    public function login()
    {
        return Inertia::render('login');
    }
}
