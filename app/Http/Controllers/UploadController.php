<?php

namespace App\Http\Controllers;

use App\Data\AdCampaignData;
use App\Data\AdSetData;
use App\Data\FacebookPageData;
use App\Data\PixelData;
use App\Data\TargetingCountryData;
use App\Http\Integrations\MetaConnector;
use App\Http\Integrations\Requests\CreateAdSetRequest;
use App\Http\Integrations\Requests\GetAdCampaignsRequest;
use App\Http\Integrations\Requests\GetAdSetsRequest;
use App\Http\Integrations\Requests\GetFacebookPagesRequest;
use App\Http\Integrations\Requests\GetPixelsRequest;
use App\Http\Integrations\Requests\GetTargetingCountries;
use App\Http\Integrations\Requests\Inputs\AdSetInput;
use App\Http\Integrations\Requests\UploadAdCreativeRequest;
use App\Http\Integrations\Requests\UploadAdVideoCreativeRequest;
use App\Jobs\CreateAd;
use App\Jobs\CreateAdCreative;
use App\Jobs\CreateAdSet;
use App\Jobs\UploadAdCreative;
use App\Jobs\UploadAdVideoCreative;
use App\Models\AdAccount;
use App\Models\AdCreationFlow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
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

    public function createAdSet(Request $request)
    {
        $validated = $request->validate([
            'adSet.id' => ['required', 'string'],
            'adSet.label' => ['required', 'string'],
            'adSet.settings.locations' => ['required', 'array'],
            'adSet.settings.locations.*' => ['required', 'string'],
            'adSet.settings.age' => ['required', 'array'],
            'adSet.settings.age.*' => ['required', 'numeric'],
            'campaignId' => ['required', 'string'],
            'pixelId' => ['required', 'string'],
        ]);

        /** @var AdAccount $adAccount */
        $adAccount = $request->adAccount();

        $meta = new MetaConnector($request->user()->connection);

        $response = $meta->send(new CreateAdSetRequest(
            adAccount: $adAccount,
            adSet: new AdSetInput(
                label: $validated['adSet']['label'],
                countries: $validated['adSet']['settings']['locations'],
                minAge: $validated['adSet']['settings']['age'][0],
                maxAge: $validated['adSet']['settings']['age'][1],
            ),
            campaignId: $validated['campaignId'],
            pixelId: $validated['pixelId'],
        ))->throw();

        return response()->json($response->json('id'));
    }

    public function uploadPhoto(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string'],
            'file' => ['required', File::types(['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi'])->max('4gb')],
            'thumbnail' => ['nullable', File::image()->max('20mb')],
        ]);

        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk('uploaded-ads');

        $file = $validated['file'];
        $thumbnail = $validated['thumbnail'] ?? null;

        $filePath = Str::uuid().'.'.$file->extension();
        $thumbnailPath = $thumbnail ? (Str::uuid().'.'.$thumbnail->extension()) : null;

        $disk->put($filePath, file_get_contents($file->getRealPath()));

        if ($thumbnail) {
            // Upload thumbnail if present
            $disk->put($thumbnailPath, file_get_contents($thumbnail->getRealPath()));
        }

        return response()->json([
            'file' => $filePath,
            'thumbnail' => $thumbnail ? $thumbnailPath : null,
        ]);

        // /** @var AdAccount $adAccount */
        // $adAccount = $request->adAccount();

        // $meta = new MetaConnector($request->user()->connection);

        // $uploadResponse = $meta->send(new UploadAdCreativeRequest(
        //     adAccount: $adAccount,
        //     creative: $photo,
        //     label: $validated['name']
        // ))->throw();

        // $images = collect($uploadResponse->json('images'));
        // $hash = $images->first()['hash'];

        // return response()->json([
        //     'hash' => $hash,
        // ]);
    }

    public function uploadVideo(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string'],
            'file' => ['required', File::types(['mp4', 'mov', 'm4v', 'avi'])->max('4gb')],
        ]);

        $video = $validated['file'];

        // Upload video to R2

        // /** @var AdAccount $adAccount */
        // $adAccount = $request->adAccount();

        // $meta = new MetaConnector($request->user()->connection);

        // $uploadResponse = $meta->send(new UploadAdVideoCreativeRequest(
        //     adAccount: $adAccount,
        //     creative: $video,
        //     label: $validated['name']
        // ))->throw();

        // $videoId = $uploadResponse->json('id');

        // return response()->json([
        //     'videoId' => $videoId,
        // ]);
    }

    public function createAd(Request $request)
    {
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

        CreateAd::dispatch(
            adAccount: $adAccount,
            metaConnection: $request->user()->connection,
            //
            adSetId: $validated['adSetId'],
            name: $validated['name'],
            hash: $validated['hash'],
            videoId: $validated['videoId'] ?? null,
            facebookPageId: $validated['facebookPageId'],
            instagramPageId: $validated['instagramPageId'] ?? null,
            cta: $validated['creativeSettings']['cta'],
            //
            pausedByDefault: $validated['settings']['pausedByDefault']
        );

        return response()->json('OK');
    }

    public function create(Request $request)
    {
        // New creation route which executes all tasks as seperate jobs (https://chatgpt.com/c/68e91b71-5a90-8333-9754-1fc69900048d)

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
            'adSets.*.creatives' => ['required', 'array'],
            'adSets.*.creatives.*.id' => ['required', 'string'],
            'adSets.*.creatives.*.label' => ['required', 'string'],
            'adSets.*.creatives.*.path' => ['required', 'array'],
            'adSets.*.creatives.*.path.file' => ['required', 'string'],
            'adSets.*.creatives.*.path.thumbnail' => ['nullable', 'string'],
            //
            'campaignId' => ['required', 'string'],
            'pixelId' => ['required', 'string'],
        ]);

        /** @var AdAccount $adAccount */
        $adAccount = $request->adAccount();

        $adSets = $validated['adSets'];
        $campaignId = $validated['campaignId'];
        $pixelId = $validated['pixelId'];

        $mappedAdSets = collect($validated['adSets'])->map(fn ($adSet) => [
            'external_id' => null,
            'status' => 'pending',
            'creatives' => collect($adSet['creatives'])->map(fn ($creative) => [
                'hash' => null,
                'status' => 'pending',
                'external_id' => null,
            ])->toArray(),
        ])->toArray();

        $flow = AdCreationFlow::create([
            'adSets' => $mappedAdSets,
            'user_id' => $request->user()->id,
            'ad_account_id' => $adAccount->id,
        ]);

        // Dispatch queue jobs
        foreach ($adSets as $adSetIndex => $adSet) {
            $jobs = [];
            $jobs[] = new CreateAdSet(
                adCreationFlow: $flow,
                adSetIndex: $adSetIndex,
                input: new AdSetInput(
                    label: $adSet['label'],
                    countries: $adSet['settings']['locations'],
                    minAge: $adSet['settings']['age'][0],
                    maxAge: $adSet['settings']['age'][1]
                ),
                campaignId: $campaignId,
                pixelId: $pixelId
            );

            foreach ($adSet['creatives'] as $creative) {
                $thumbnail = $creative['path']['thumbnail'];
                $isVideo = $thumbnail !== null;

                if ($isVideo) {
                    // Thumbnail
                    $jobs[] = new UploadAdCreative(
                        adCreationFlow: $flow,
                        label: $creative['label'],
                        path: $creative['path']['thumbnail']
                    );

                    // Video
                    $jobs[] = new UploadAdVideoCreative(
                        adCreationFlow: $flow,
                        label: $creative['label'],
                        path: $creative['path']['file']
                    );
                } else {
                    $jobs[] = new UploadAdCreative(
                        adCreationFlow: $flow,
                        label: $creative['label'],
                        path: $creative['path']['file']
                    );
                }

                $jobs[] = new CreateAdCreative(
                    adCreationFlow: $flow
                );
                // $jobs[] = new CreateAd(
                //     adCreationFlow: $flow
                // );
            }

            Bus::chain($jobs)->dispatch();
        }

        return response()->json($flow);
    }
}
