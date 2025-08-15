<?php

namespace App\Http\Controllers;

use App\Data\AdCampaignData;
use App\Data\AdData;
use App\Data\AdSetData;
use App\Http\Integrations\MetaConnector;
use App\Http\Integrations\Requests\GetAdCampaignsRequest;
use App\Http\Integrations\Requests\GetAdSetsRequest;
use App\Http\Integrations\Requests\GetAdsRequest;
use App\Http\Integrations\Requests\GetInsightsRequest;
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
        $insightsRequest = new GetInsightsRequest($adAccount, 'campaign');

        return Inertia::render('campaigns/index', [
            'campaigns' => Inertia::defer(function () use ($meta, $adCampaignsRequest, $insightsRequest) {
                $campaigns = collect($meta->paginate($adCampaignsRequest)->collect()->all());
                $insights = collect($meta->paginate($insightsRequest)->collect()->all());

                $insightsByCampaign = $insights->keyBy('campaign_id');

                $campaigns = $campaigns->map(function ($campaign) use ($insightsByCampaign) {
                    $campaign['insights'] = $insightsByCampaign->get($campaign['id'], null);

                    return $campaign;
                });

                return AdCampaignData::collect($campaigns);
            }),
        ]);
    }

    public function adSets(Request $request)
    {
        /** @var AdAccount $adAccount */
        $adAccount = $request->adAccount();

        $meta = new MetaConnector($request->user()->connection);

        $adSetsRequest = new GetAdSetsRequest($adAccount);
        $insightsRequest = new GetInsightsRequest($adAccount, 'adset');

        return Inertia::render('campaigns/adsets', [
            'adSets' => Inertia::defer(function () use ($meta, $adSetsRequest, $insightsRequest) {
                $adSets = collect($meta->paginate($adSetsRequest)->collect()->all());
                $insights = collect($meta->paginate($insightsRequest)->collect()->all());

                $insightsByAdSet = $insights->keyBy('adset_id');

                $adSets = $adSets->map(function ($adSet) use ($insightsByAdSet) {
                    $adSet['insights'] = $insightsByAdSet->get($adSet['id'], null);

                    return $adSet;
                });

                return AdSetData::collect($adSets);
            }),
        ]);
    }

    public function ads(Request $request)
    {
        /** @var AdAccount $adAccount */
        $adAccount = $request->adAccount();

        $meta = new MetaConnector($request->user()->connection);

        $adsRequest = new GetAdsRequest($adAccount);
        $insightsRequest = new GetInsightsRequest($adAccount, 'ad');

        return Inertia::render('campaigns/ads', [
            'ads' => Inertia::defer(function () use ($meta, $adsRequest, $insightsRequest) {
                $ads = collect($meta->paginate($adsRequest)->collect()->all());
                $insights = collect($meta->paginate($insightsRequest)->collect()->all());

                $insightsByAds = $insights->keyBy('ad_id');

                $ads = $ads->map(function ($ad) use ($insightsByAds) {
                    $ad['insights'] = $insightsByAds->get($ad['id'], null);

                    return $ad;
                });

                return AdData::collect($ads);
            }),
        ]);
    }

    public function refresh()
    {
        // Here we wanna just invalidate the cache of the type (campaigns/ad sets/ads) and reload the current route props via Inertia
    }
}
