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

class CommandMenuController extends Controller
{
    public function campaigns(Request $request)
    {
        /** @var AdAccount $adAccount */
        $adAccount = $request->adAccount();

        $meta = new MetaConnector($request->user()->connection);

        $adCampaignsRequest = new GetAdCampaignsRequest($adAccount);

        $campaigns = collect($meta->paginate($adCampaignsRequest)->collect()->all());

        $cacheKey = $adCampaignsRequest->getCacheKey($meta->createPendingRequest($adCampaignsRequest));

        return response()->json([
            'campaigns' => AdCampaignData::collect($campaigns),
            'cacheKey' => $cacheKey ? hash('sha256', $cacheKey) : null,
        ]);
    }

    public function adSets(Request $request)
    {
        /** @var AdAccount $adAccount */
        $adAccount = $request->adAccount();

        $meta = new MetaConnector($request->user()->connection);

        $adSetsRequest = new GetAdSetsRequest($adAccount);

        $adSets = collect($meta->paginate($adSetsRequest)->collect()->all());

        $cacheKey = $adSetsRequest->getCacheKey($meta->createPendingRequest($adSetsRequest));

        return response()->json([
            'adSets' => AdSetData::collect($adSets),
            'cacheKey' => $cacheKey ? hash('sha256', $cacheKey) : null,
        ]);
    }

    public function ads(Request $request)
    {
        /** @var AdAccount $adAccount */
        $adAccount = $request->adAccount();

        $meta = new MetaConnector($request->user()->connection);

        $adsRequest = new GetAdsRequest($adAccount);

        $ads = collect($meta->paginate($adsRequest)->collect()->all());

        $cacheKey = $adsRequest->getCacheKey($meta->createPendingRequest($adsRequest));

        return response()->json([
            'ads' => AdData::collect($ads),
            'cacheKey' => $cacheKey ? hash('sha256', $cacheKey) : null,
        ]);
    }
}
