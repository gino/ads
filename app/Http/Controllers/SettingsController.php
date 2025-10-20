<?php

namespace App\Http\Controllers;

use App\Data\AdAccountData;
use App\Data\FacebookPageData;
use App\Data\PixelData;
use App\Data\TargetingCountryData;
use App\Http\Integrations\MetaConnector;
use App\Http\Integrations\Requests\GetFacebookPagesRequest;
use App\Http\Integrations\Requests\GetPixelsRequest;
use App\Http\Integrations\Requests\GetTargetingCountriesRequest;
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

        $defaults = $adAccount->getSettings([
            'dsa_payor',
            'dsa_beneficiary',
        ]);

        return Inertia::render('settings/ad-account/advertising-identity', [
            'defaults' => [
                'dsaPayor' => fn () => $defaults['dsa_payor'],
                'dsaBeneficiary' => fn () => $defaults['dsa_beneficiary'],
            ],
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

    public function defaults(Request $request)
    {
        /** @var AdAccount $adAccount */
        $adAccount = $request->adAccount();

        $meta = new MetaConnector($request->user()->connection);

        $defaults = $adAccount->getSettings([
            'website_url',
            'pixel_id',
            'facebook_page_id',
            'instagram_page_id',
            'utm_parameters',
            'paused_by_default',
            'disable_enhancements',
            'disable_multi_ads',
            'locations',
        ]);

        return Inertia::render('settings/ad-account/defaults', [
            'defaults' => fn () => [
                'websiteUrl' => $defaults['website_url'],
                'pixelId' => $defaults['pixel_id'],
                'facebookPageId' => $defaults['facebook_page_id'],
                'instagramPageId' => $defaults['instagram_page_id'],
                'utmParameters' => $defaults['utm_parameters'],
                'pausedByDefault' => $defaults['paused_by_default'],
                'disableEnhancements' => $defaults['disable_enhancements'],
                'disableMultiAds' => $defaults['disable_multi_ads'],
                'locations' => $defaults['locations'],
            ],
            'pixels' => Inertia::defer(function () use ($meta, $adAccount) {
                $pixels = $meta->paginate(new GetPixelsRequest($adAccount))->collect();

                return PixelData::collect($pixels);
            }, 'pixels'),
            'pages' => Inertia::defer(function () use ($meta, $adAccount) {
                $pages = $meta->paginate(new GetFacebookPagesRequest($adAccount))->collect();

                return FacebookPageData::collect($pages);
            }, 'pages'),
            'countries' => Inertia::defer(function () use ($meta) {
                $countries = $meta->send(new GetTargetingCountriesRequest)->json('data', []);

                return TargetingCountryData::collect($countries);
            }, 'countries'),
        ]);
    }

    public function updateDefaults(Request $request)
    {
        $validated = $request->validate([
            'websiteUrl' => ['nullable', 'string', 'url'],
            'pixelId' => ['nullable', 'string'],
            'facebookPageId' => ['nullable', 'string'],
            'instagramPageId' => ['nullable', 'string'],
            'utmParameters' => ['nullable', 'string'],
            'pausedByDefault' => ['nullable', 'boolean'],
            'disableEnhancements' => ['nullable', 'boolean'],
            'disableMultiAds' => ['nullable', 'boolean'],
            'locations' => ['nullable', 'array'],
        ]);

        /** @var AdAccount $adAccount */
        $adAccount = $request->adAccount();

        $adAccount->setSettings([
            'website_url' => $validated['websiteUrl'],
            'pixel_id' => $validated['pixelId'],
            'facebook_page_id' => $validated['facebookPageId'],
            'instagram_page_id' => $validated['instagramPageId'],
            'utm_parameters' => $validated['utmParameters'],
            'paused_by_default' => $validated['pausedByDefault'],
            'disable_enhancements' => $validated['disableEnhancements'],
            'disable_multi_ads' => $validated['disableMultiAds'],
            'locations' => $validated['locations'],
        ]);

        return redirect()->back();
    }
}
