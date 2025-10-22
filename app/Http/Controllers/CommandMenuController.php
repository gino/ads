<?php

namespace App\Http\Controllers;

use App\Data\AdCampaignData;
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

        return AdCampaignData::collect($campaigns);
    }

    public function adSets(Request $request)
    {
        /** @var AdAccount $adAccount */
        $adAccount = $request->adAccount();

        $meta = new MetaConnector($request->user()->connection);

        $adSetsRequest = new GetAdSetsRequest($adAccount);

        $adSets = collect($meta->paginate($adSetsRequest)->collect()->all());

        return AdSetData::collect($adSets);
    }

    public function ads(Request $request)
    {
        /** @var AdAccount $adAccount */
        $adAccount = $request->adAccount();

        $meta = new MetaConnector($request->user()->connection);

        $adsRequest = new GetAdsRequest($adAccount);

        $ads = collect($meta->paginate($adsRequest)->collect()->all());

        return AdSetData::collect($ads);
    }
}
