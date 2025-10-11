<?php

namespace App\Http\Controllers;

use App\Data\AdCampaignData;
use App\Data\AdSetData;
use App\Data\FacebookPageData;
use App\Data\PixelData;
use App\Data\TargetingCountryData;
use App\Http\Integrations\MetaConnector;
use App\Http\Integrations\Requests\GetAdCampaignsRequest;
use App\Http\Integrations\Requests\GetAdSetsRequest;
use App\Http\Integrations\Requests\GetFacebookPagesRequest;
use App\Http\Integrations\Requests\GetPixelsRequest;
use App\Http\Integrations\Requests\GetTargetingCountries;
use App\Http\Integrations\Requests\Inputs\AdSetInput;
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
    }

    public function create(Request $request)
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
            'adSets.*.creatives' => ['required', 'array'],
            'adSets.*.creatives.*.id' => ['required', 'string'],
            'adSets.*.creatives.*.label' => ['required', 'string'],
            'adSets.*.creatives.*.path' => ['required', 'array'],
            'adSets.*.creatives.*.path.file' => ['required', 'string'],
            'adSets.*.creatives.*.path.thumbnail' => ['nullable', 'string'],
            //
            'adSets.*.creatives.*.settings.cta' => ['nullable', 'string'],
            //
            'hasSelectedAdSet' => ['required', 'boolean'],
            'campaignId' => ['required', 'string'],
            'pixelId' => ['required', 'string'],
            'facebookPageId' => ['required', 'string'],
            'instagramPageId' => ['nullable', 'string'],
            //
            'settings.pausedByDefault' => ['required', 'boolean'],
            'settings.disableEnhancements' => ['required', 'boolean'],
            'settings.disablePromoCodes' => ['required', 'boolean'],
        ]);

        /** @var AdAccount $adAccount */
        $adAccount = $request->adAccount();

        $adSets = $validated['adSets'];
        $campaignId = $validated['campaignId'];
        $pixelId = $validated['pixelId'];
        $facebookPageId = $validated['facebookPageId'];
        $instagramPageId = $validated['instagramPageId'];
        $settings = $validated['settings'];
        $hasSelectedAdSet = $validated['hasSelectedAdSet'];

        $mappedAdSets = collect($validated['adSets'])->map(fn ($adSet) => [
            'id' => $hasSelectedAdSet ? $adSet['id'] : null,
            'creatives' => collect($adSet['creatives'])->map(fn ($creative) => [
                'id' => null,
                'hash' => null,
                'video_id' => null,
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

            if (! $hasSelectedAdSet) {
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
            }

            foreach ($adSet['creatives'] as $creativeIndex => $creative) {
                $thumbnail = $creative['path']['thumbnail'];
                $isVideo = $thumbnail !== null;

                if ($isVideo) {
                    // Thumbnail
                    $jobs[] = new UploadAdCreative(
                        adCreationFlow: $flow,
                        adSetIndex: $adSetIndex,
                        creativeIndex: $creativeIndex,
                        label: $creative['label'],
                        path: $creative['path']['thumbnail']
                    );

                    // Video
                    $jobs[] = new UploadAdVideoCreative(
                        adCreationFlow: $flow,
                        adSetIndex: $adSetIndex,
                        creativeIndex: $creativeIndex,
                        label: $creative['label'],
                        path: $creative['path']['file']
                    );
                } else {
                    $jobs[] = new UploadAdCreative(
                        adCreationFlow: $flow,
                        adSetIndex: $adSetIndex,
                        creativeIndex: $creativeIndex,
                        label: $creative['label'],
                        path: $creative['path']['file']
                    );
                }

                $jobs[] = new CreateAdCreative(
                    adCreationFlow: $flow,
                    adSetIndex: $adSetIndex,
                    creativeIndex: $creativeIndex,
                    label: $creative['label'],
                    facebookPageId: $facebookPageId,
                    instagramPageId: $instagramPageId,
                    cta: $creative['settings']['cta']
                );
                $jobs[] = new CreateAd(
                    adCreationFlow: $flow,
                    adSetIndex: $adSetIndex,
                    creativeIndex: $creativeIndex,
                    label: $creative['label'],
                    pausedByDefault: $settings['pausedByDefault']
                );
            }

            Bus::chain($jobs)->dispatch();
        }

        return response()->json($flow);
    }
}
