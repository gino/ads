<?php

namespace App\Http\Controllers;

use App\Data\AdCampaignData;
use App\Data\AdSetData;
use App\Data\FacebookPageData;
use App\Data\PixelData;
use App\Data\TargetingCountryData;
use App\Http\Integrations\MetaConnector;
use App\Http\Integrations\Requests\CreateAdCreativeRequest;
use App\Http\Integrations\Requests\CreateAdSetsRequest;
use App\Http\Integrations\Requests\GetAdCampaignsRequest;
use App\Http\Integrations\Requests\GetAdSetsRequest;
use App\Http\Integrations\Requests\GetFacebookPagesRequest;
use App\Http\Integrations\Requests\GetPixelsRequest;
use App\Http\Integrations\Requests\GetTargetingCountries;
use App\Http\Integrations\Requests\Inputs\AdSetInput;
use App\Http\Integrations\Requests\UploadAdCreativeRequest;
use App\Models\AdAccount;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\File;
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

        $pagesRequest = new GetFacebookPagesRequest($adAccount);

        $targetCountriesRequest = new GetTargetingCountries;

        return Inertia::render('upload', [
            'campaigns' => Inertia::defer(function () use ($meta, $adCampaignsRequest) {
                $campaigns = $meta->paginate($adCampaignsRequest)->collect();

                return AdCampaignData::collect($campaigns);
            }),
            'adSets' => Inertia::defer(function () use ($meta, $adSetsRequest) {
                $adSets = $meta->paginate($adSetsRequest)->collect();

                return AdSetData::collect($adSets);
            }),
            'pixels' => Inertia::defer(function () use ($meta, $pixelsRequest) {
                $pixels = $meta->paginate($pixelsRequest)->collect();

                return PixelData::collect($pixels);
            }),
            'countries' => Inertia::defer(function () use ($meta, $targetCountriesRequest) {
                $countries = $meta->send($targetCountriesRequest)->json('data', []);

                return TargetingCountryData::collect($countries);
            }),
            'pages' => Inertia::defer(function () use ($meta, $pagesRequest, $adAccount) {
                $pages = $adAccount->business_id ? $meta->paginate($pagesRequest)->collect() : [];

                return FacebookPageData::collect($pages);
            }),
        ]);
    }

    public function createAdSets(Request $request)
    {
        $validated = $request->validate([
            'adSets' => ['required', 'array'],
            'adSets.*.id' => ['required', 'string'],
            'adSets.*.label' => ['required', 'string'],
            //
            'adSets.*.settings.locations' => ['required', 'array'],
            'adSets.*.settings.locations.*' => ['required', 'string'],
            //
            'campaignId' => ['required', 'string'],
            'pixelId' => ['required', 'string'],
            //
            'settings.pausedByDefault' => ['required', 'boolean'],
            'settings.disableEnhancements' => ['required', 'boolean'],
            'settings.disablePromoCodes' => ['required', 'boolean'],
        ]);

        /** @var AdAccount $adAccount */
        $adAccount = $request->adAccount();

        $meta = new MetaConnector($request->user()->connection);

        $adSets = collect($validated['adSets'])->map(function ($adSet) {
            return [
                'label' => $adSet['label'],
                'countries' => $adSet['settings']['locations'],
            ];
        });

        $createAdSetsRequest = new CreateAdSetsRequest(
            adAccount: $adAccount,
            adSets: AdSetInput::collect($adSets)->toArray(),
            campaignId: $validated['campaignId'],
            pixelId: $validated['pixelId'],
            //
            pausedByDefault: $validated['settings']['pausedByDefault']
        );

        $response = $meta->send($createAdSetsRequest);

        $ids = [];
        foreach ($response->json() as $createdAdSet) {
            $data = json_decode($createdAdSet['body']);
            $id = $data->id;
            $ids[] = $id;
        }

        return response()->json($ids);
    }

    public function uploadCreative(Request $request)
    {
        $types = ['jpeg', 'jpg', 'png', 'gif', 'mp4', 'mov', 'avi', 'm4v'];
        $maxSize = '4gb';

        $validated = $request->validate([
            'id' => ['required', 'uuid'],
            'name' => ['required', 'string'],
            'file' => [
                'required',
                File::types($types)
                    ->min('1kb')
                    ->max($maxSize),
            ],
            'adSetId' => ['required', 'string'],
        ]);

        /** @var AdAccount $adAccount */
        $adAccount = $request->adAccount();

        $meta = new MetaConnector($request->user()->connection);

        $creativeName = $validated['name'];

        $uploadAdCreativeRequest = new UploadAdCreativeRequest(
            $adAccount,
            $request->file('file'),
            $creativeName
        );

        // $uploadResponse = $meta->send($uploadAdCreativeRequest);

        // $images = collect($uploadResponse->json('images'));
        // $hash = $images->first()['hash'];

        $createAdCreativeRequest = new CreateAdCreativeRequest(
            $adAccount,
            $creativeName,
            'some hash'
        );
        $createdAdCreativeResponse = $meta->send($createAdCreativeRequest);

        return response()->json($createdAdCreativeResponse->json());
    }
}
