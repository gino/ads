<?php

namespace App\Http\Controllers;

use App\Data\AdAccountData;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function account()
    {
        return Inertia::render('settings/account');
    }

    public function adAccounts(Request $request)
    {
        $user = $request->user();

        return Inertia::render('settings/ad-accounts', [
            'adAccounts' => AdAccountData::collect($user->adAccounts()->get()),
        ]);
    }

    public function general()
    {
        return Inertia::render('settings/ad-account/general');
    }
}
