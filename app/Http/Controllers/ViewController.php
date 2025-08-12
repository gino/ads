<?php

namespace App\Http\Controllers;

use App\Data\AdCampaignData;
use App\Http\Integrations\MetaConnector;
use App\Http\Integrations\Requests\GetAdCampaignsRequest;
use App\Models\AdAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ViewController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('index');
    }

    public function campaigns(Request $request)
    {
        /** @var AdAccount $adAccount */
        $adAccount = $request->adAccount();

        $meta = new MetaConnector($request->user()->connection);

        return Inertia::render('campaigns', [
            'campaigns' => Inertia::defer(function () use ($meta, $adAccount) {
                $data = $meta->paginate(new GetAdCampaignsRequest($adAccount));
                $campaigns = AdCampaignData::collect($data->collect());

                return [
                    ...$campaigns,
                    ...$campaigns,
                    ...$campaigns,
                ];
            }),
        ]);
    }

    public function login()
    {
        return Inertia::render('login');
    }
}
