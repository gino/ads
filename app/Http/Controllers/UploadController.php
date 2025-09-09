<?php

namespace App\Http\Controllers;

use App\Data\AdCampaignData;
use App\Data\AdSetData;
use App\Data\PixelData;
use App\Http\Integrations\MetaConnector;
use App\Http\Integrations\Requests\GetAdCampaignsRequest;
use App\Http\Integrations\Requests\GetAdSetsRequest;
use App\Http\Integrations\Requests\GetPixelsRequest;
use App\Models\AdAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UploadController extends Controller
{
    public function index(Request $request)
    {
        /** @var AdAccount $adAccount */
        $adAccount = $request->adAccount();

        $meta = new MetaConnector($request->user()->connection);

        $adCampaignsRequest = new GetAdCampaignsRequest($adAccount);
        $adSetsRequest = new GetAdSetsRequest($adAccount);
        $pixelsRequest = new GetPixelsRequest($adAccount);

        return Inertia::render('upload', [
            'campaigns' => Inertia::defer(function () use ($meta, $adCampaignsRequest) {
                $campaigns = collect($meta->paginate($adCampaignsRequest)->collect()->all());

                return AdCampaignData::collect($campaigns);
            }),
            'adSets' => Inertia::defer(function () use ($meta, $adSetsRequest) {
                $adSets = collect($meta->paginate($adSetsRequest)->collect()->all());

                return AdSetData::collect($adSets);
            }),
            'pixels' => Inertia::defer(function () use ($meta, $pixelsRequest) {
                $pixels = collect($meta->paginate($pixelsRequest)->collect()->all());

                return PixelData::collect($pixels);
            }),
        ]);
    }
}
