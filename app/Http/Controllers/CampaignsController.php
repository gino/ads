<?php

namespace App\Http\Controllers;

use App\Data\AdCampaignData;
use App\Http\Integrations\MetaConnector;
use App\Http\Integrations\Requests\GetAdCampaignsRequest;
use App\Models\AdAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CampaignsController extends Controller
{
    public function campaigns(Request $request)
    {
        /** @var AdAccount $adAccount */
        $adAccount = $request->adAccount();

        $meta = new MetaConnector($request->user()->connection);

        return Inertia::render('campaigns/index', [
            'view' => 'campaigns',
            'campaigns' => Inertia::defer(function () use ($meta, $adAccount) {
                $data = $meta->paginate(new GetAdCampaignsRequest($adAccount));
                $campaigns = AdCampaignData::collect($data->collect());

                return [
                    ...$campaigns,
                    ...$campaigns,
                    ...$campaigns,
                    ...$campaigns,
                    ...$campaigns,
                    ...$campaigns,
                ];
            }),
        ]);
    }

    public function adSets()
    {
        return Inertia::render('campaigns/adsets');
    }

    public function ads()
    {
        return Inertia::render('campaigns/ads');
    }
}
