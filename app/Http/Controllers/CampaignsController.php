<?php

namespace App\Http\Controllers;

use App\Data\AdCampaignData;
use App\Data\AdData;
use App\Data\AdSetData;
use App\Http\Integrations\MetaConnector;
use App\Http\Integrations\Requests\GetAdCampaignsRequest;
use App\Http\Integrations\Requests\GetAdSetsRequest;
use App\Http\Integrations\Requests\GetAdsRequest;
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
        $adCampaignsRequest = new GetAdCampaignsRequest($adAccount);

        return Inertia::render('campaigns/index', [
            'campaigns' => Inertia::defer(function () use ($meta, $adCampaignsRequest) {
                $data = $meta->paginate($adCampaignsRequest);
                $campaigns = AdCampaignData::collect($data->collect());

                return $campaigns;
            }),
        ]);
    }

    public function adSets(Request $request)
    {
        /** @var AdAccount $adAccount */
        $adAccount = $request->adAccount();

        $meta = new MetaConnector($request->user()->connection);
        $adSetsRequest = new GetAdSetsRequest($adAccount);

        return Inertia::render('campaigns/adsets', [
            'adSets' => Inertia::defer(function () use ($meta, $adSetsRequest) {
                $data = $meta->paginate($adSetsRequest);
                $adSets = AdSetData::collect($data->collect());

                return $adSets;
            }),
        ]);
    }

    public function ads(Request $request)
    {
        /** @var AdAccount $adAccount */
        $adAccount = $request->adAccount();

        $meta = new MetaConnector($request->user()->connection);
        $adsRequest = new GetAdsRequest($adAccount);

        return Inertia::render('campaigns/ads', [
            'ads' => Inertia::defer(function () use ($meta, $adsRequest) {
                $data = $meta->paginate($adsRequest);
                $ads = AdData::collect($data->collect());

                return $ads;
            }),
        ]);
    }

    public function refresh()
    {
        // Here we wanna just invalidate the cache of the type (campaigns/ad sets/ads) and reload the current route props via Inertia
    }
}
