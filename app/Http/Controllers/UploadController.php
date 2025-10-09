<?php

namespace App\Http\Controllers;

use App\Data\AdCampaignData;
use App\Data\AdSetData;
use App\Data\FacebookPageData;
use App\Data\PixelData;
use App\Data\TargetingCountryData;
use App\Http\Integrations\MetaConnector;
use App\Http\Integrations\Requests\CreateAdCreativeRequest;
use App\Http\Integrations\Requests\CreateAdRequest;
use App\Http\Integrations\Requests\CreateAdSetsRequest;
use App\Http\Integrations\Requests\GetAdCampaignsRequest;
use App\Http\Integrations\Requests\GetAdSetsRequest;
use App\Http\Integrations\Requests\GetFacebookPagesRequest;
use App\Http\Integrations\Requests\GetPixelsRequest;
use App\Http\Integrations\Requests\GetTargetingCountries;
use App\Http\Integrations\Requests\Inputs\AdSetInput;
use App\Http\Integrations\Requests\UploadAdCreativeRequest;
use App\Http\Integrations\Requests\UploadAdVideoCreativeRequest;
use App\Models\AdAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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
            'pages' => Inertia::defer(function () use ($meta, $pagesRequest) {
                // $pages = $adAccount->business_id ? $meta->paginate($pagesRequest)->collect() : [];
                $pages = $meta->paginate($pagesRequest)->collect();

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
            'adSets.*.settings.age' => ['required', 'array'],
            'adSets.*.settings.age.*' => ['required', 'numeric'],
            //
            'campaignId' => ['required', 'string'],
            'pixelId' => ['required', 'string'],
        ]);

        /** @var AdAccount $adAccount */
        $adAccount = $request->adAccount();

        $meta = new MetaConnector($request->user()->connection);

        $adSets = collect($validated['adSets'])->map(function ($adSet) {
            return [
                'label' => $adSet['label'],
                'countries' => $adSet['settings']['locations'],
                'minAge' => $adSet['settings']['age'][0],
                'maxAge' => $adSet['settings']['age'][1],
            ];
        });

        $response = $meta->send(new CreateAdSetsRequest(
            adAccount: $adAccount,
            adSets: AdSetInput::collect($adSets)->toArray(),
            campaignId: $validated['campaignId'],
            pixelId: $validated['pixelId'],
        ))->throw();

        Log::debug($response->json());
        dd($response->json());

        $ids = [];
        foreach ($response->json() as $createdAdSet) {
            $data = json_decode($createdAdSet['body']);
            $id = $data->id;
            $ids[] = $id;
        }

        return response()->json($ids);
    }

    public function uploadPhoto(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string'],
            'file' => ['required', File::image()->max('20mb')],
        ]);

        $photo = $validated['file'];

        /** @var AdAccount $adAccount */
        $adAccount = $request->adAccount();

        $meta = new MetaConnector($request->user()->connection);

        $uploadResponse = $meta->send(new UploadAdCreativeRequest(
            adAccount: $adAccount,
            creative: $photo,
            label: $validated['name']
        ))->throw();

        $images = collect($uploadResponse->json('images'));
        $hash = $images->first()['hash'];

        return response()->json([
            'hash' => $hash,
        ]);
    }

    public function uploadVideo(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string'],
            'file' => ['required', File::types(['mp4', 'mov', 'm4v', 'avi'])->max('4gb')],
        ]);

        $video = $validated['file'];

        /** @var AdAccount $adAccount */
        $adAccount = $request->adAccount();

        $meta = new MetaConnector($request->user()->connection);

        $uploadResponse = $meta->send(new UploadAdVideoCreativeRequest(
            adAccount: $adAccount,
            creative: $video,
            label: $validated['name']
        ))->throw();

        $videoId = $uploadResponse->json('id');

        return response()->json([
            'videoId' => $videoId,
        ]);
    }

    public function createAd(Request $request)
    {
        // This can be moved to a queue job maybe: https://chatgpt.com/c/68e165a6-ebcc-832c-8bb1-154f77b8d92b

        $validated = $request->validate([
            'name' => ['required', 'string'],
            'hash' => ['required', 'string'],
            'videoId' => ['nullable', 'string'],
            'adSetId' => ['required', 'string'],
            'facebookPageId' => ['required', 'string'],
            'instagramPageId' => ['nullable', 'string'],
            //
            'creativeSettings.cta' => ['required', 'string'],
            //
            'settings.pausedByDefault' => ['required', 'boolean'],
            'settings.disableEnhancements' => ['required', 'boolean'],
            'settings.disablePromoCodes' => ['required', 'boolean'],
        ]);

        /** @var AdAccount $adAccount */
        $adAccount = $request->adAccount();

        $meta = new MetaConnector($request->user()->connection);

        $createdAdCreativeResponse = $meta->send(new CreateAdCreativeRequest(
            adAccount: $adAccount,
            name: $validated['name'],
            hash: $validated['hash'],
            videoId: $validated['videoId'] ?? null,
            facebookPageId: $validated['facebookPageId'],
            instagramPageId: $validated['instagramPageId'] ?? null,
            //
            cta: $validated['creativeSettings']['cta']
        ))->throw();

        $creativeId = $createdAdCreativeResponse->json('id');

        $createdAdResponse = $meta->send(new CreateAdRequest(
            adAccount: $adAccount,
            name: $validated['name'],
            creativeId: $creativeId,
            adSetId: $validated['adSetId'],
            pausedByDefault: $validated['settings']['pausedByDefault']
        ))->throw();

        return response()->json($createdAdResponse->json());
    }
}
