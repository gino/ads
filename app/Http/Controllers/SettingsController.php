<?php

namespace App\Http\Controllers;

use App\Data\AdAccountData;
use App\Models\AdAccount;
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
            'adAccounts' => fn () => AdAccountData::collect($user->adAccounts()->get()),
        ]);
    }

    public function general()
    {
        return Inertia::render('settings/ad-account/general');
    }

    public function advertisingIdentity(Request $request)
    {
        /** @var AdAccount $adAccount */
        $adAccount = $request->adAccount();

        $settings = $adAccount->getSettings([
            'dsa_payor',
            'dsa_beneficiary',
        ]);

        return Inertia::render('settings/advertising-identity', [
            'dsaPayor' => fn () => $settings['dsa_payor'],
            'dsaBeneficiary' => fn () => $settings['dsa_beneficiary'],
        ]);
    }

    public function updateAdvertisingIdentity(Request $request)
    {
        $validated = $request->validate([
            'dsaPayor' => ['required', 'string'],
            'dsaBeneficiary' => ['required', 'string'],
        ]);

        /** @var AdAccount $adAccount */
        $adAccount = $request->adAccount();

        $adAccount->setSettings([
            'dsa_payor' => $validated['dsaPayor'],
            'dsa_beneficiary' => $validated['dsaBeneficiary'],
        ]);

        return redirect()->back();
    }
}
