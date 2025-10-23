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
use App\Http\Integrations\Requests\GetTargetingCountriesRequest;
use App\Http\Integrations\Requests\Inputs\AdSetInput;
use App\Jobs\AdCreationFlowCompleted;
use App\Jobs\CreateAd;
use App\Jobs\CreateAdCreative;
use App\Jobs\CreateAdSet;
use App\Jobs\UploadAdCreative;
use App\Jobs\UploadAdVideoCreative;
use App\Models\AdAccount;
use App\Models\AdCreationFlow;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\File;
use Inertia\Inertia;
use Throwable;

class UploadController extends Controller
{
    public function index(Request $request)
    {
        /** @var AdAccount $adAccount */
        $adAccount = $request->adAccount();

        $connection = $request->user()->connection;
        $meta = new MetaConnector($connection);

        $campaignId = $request->query('campaignId');

        $defaults = $adAccount->getSettings([
            'website_url',
            'pixel_id',
            'facebook_page_id',
            'instagram_page_id',
            'utm_parameters',
            'paused_by_default',
            'disable_enhancements',
            'disable_multi_ads',
            'locations',
            'age',
            'gender',
            'primary_text',
            'headline',
            'description',
            'cta',
        ]);

        return Inertia::render('upload', [
            'campaigns' => Inertia::defer(function () use ($meta, $adAccount) {
                $campaigns = $meta->paginate(new GetAdCampaignsRequest($adAccount))->collect();

                return AdCampaignData::collect($campaigns);
            }, 'campaigns'),
            'adSets' => Inertia::defer(function () use ($meta, $adAccount, $campaignId) {
                $adSets = $campaignId ? $meta->paginate(new GetAdSetsRequest($adAccount, $campaignId))->collect() : [];

                return AdSetData::collect($adSets);
            }, 'adSets'),
            'pixels' => Inertia::defer(function () use ($meta, $adAccount, $defaults) {
                $pixels = ! $defaults['pixel_id'] ? $meta->paginate(new GetPixelsRequest($adAccount))->collect() : [];

                return PixelData::collect($pixels);
            }, 'pixels'),
            'pages' => Inertia::defer(function () use ($meta, $connection, $defaults) {
                $pages = ! $defaults['facebook_page_id'] ? $meta->paginate(new GetFacebookPagesRequest($connection))->collect() : [];

                return FacebookPageData::collect($pages);
            }, 'pages'),
            'countries' => Inertia::defer(function () use ($meta, $connection) {
                $countries = $meta->send(new GetTargetingCountriesRequest($connection))->json('data', []);

                return TargetingCountryData::collect($countries);
            }, 'countries'),
            'defaults' => fn () => [
                'websiteUrl' => $defaults['website_url'],
                'pixelId' => $defaults['pixel_id'],
                'facebookPageId' => $defaults['facebook_page_id'],
                'instagramPageId' => $defaults['instagram_page_id'],
                'utmParameters' => $defaults['utm_parameters'],
                'pausedByDefault' => $defaults['paused_by_default'],
                'disableEnhancements' => $defaults['disable_enhancements'],
                'disableMultiAds' => $defaults['disable_multi_ads'],
                'locations' => $defaults['locations'],
                'age' => $defaults['age'],
                'gender' => $defaults['gender'],
                'primaryText' => $defaults['primary_text'],
                'headline' => $defaults['headline'],
                'description' => $defaults['description'],
                'cta' => $defaults['cta'],
            ],
        ]);
    }

    public function uploadPhoto(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string'],
            'file' => ['required', File::types(['jpg', 'jpeg', 'png', 'gif', 'm4v', 'mp4', 'mov', 'avi'])->max('4gb')],
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
        $allPaths = collect($request->input('adSets', []))
            ->flatMap(fn ($adSet) => collect($adSet['creatives'] ?? [])->map(fn ($creative) => [
                $creative['path']['file'],
                $creative['path']['thumbnail'] ?? null,
            ]))
            ->flatten()
            ->filter()
            ->values()
            ->all();

        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk('uploaded-ads');

        try {
            $validated = $request->validate([
                'adSets' => ['required', 'array'],
                'adSets.*.id' => ['required', 'string'],
                'adSets.*.label' => ['required', 'string'],
                //
                'adSets.*.settings.locations' => ['required', 'array'],
                'adSets.*.settings.locations.*' => ['required', 'string'],
                'adSets.*.settings.age' => ['required', 'array'],
                'adSets.*.settings.age.*' => ['required', 'numeric'],
                'adSets.*.settings.gender' => ['required', 'string', 'in:all,men,women'],
                'adSets.*.settings.startDate*' => ['required', 'date'],
                //
                'adSets.*.creatives' => ['required', 'array'],
                'adSets.*.creatives.*.id' => ['required', 'string'],
                'adSets.*.creatives.*.label' => ['required', 'string'],
                'adSets.*.creatives.*.path' => ['required', 'array'],
                'adSets.*.creatives.*.path.file' => ['required', 'string'],
                'adSets.*.creatives.*.path.thumbnail' => ['nullable', 'string'],
                //
                'adSets.*.creatives.*.settings.cta' => ['required', 'string'],
                'adSets.*.creatives.*.settings.primaryTexts' => ['array'],
                'adSets.*.creatives.*.settings.primaryTexts.*' => ['string'],
                'adSets.*.creatives.*.settings.headlines' => ['array'],
                'adSets.*.creatives.*.settings.headlines.*' => ['string'],
                'adSets.*.creatives.*.settings.descriptions' => ['array'],
                'adSets.*.creatives.*.settings.descriptions.*' => ['string'],
                //
                'hasSelectedAdSet' => ['required', 'boolean'],
                'campaignId' => ['required', 'string'],
                'websiteUrl' => ['nullable', 'string', 'url'],
                'pixelId' => ['required', 'string'],
                'facebookPageId' => ['required', 'string'],
                'instagramPageId' => ['nullable', 'string'],
                //
                'settings.pausedByDefault' => ['required', 'boolean'],
                'settings.disableEnhancements' => ['required', 'boolean'],
                'settings.disableMultiAds' => ['required', 'boolean'],
                //
                'utmParameters' => ['nullable', 'string'],
            ]);

            /** @var AdAccount $adAccount */
            $adAccount = $request->adAccount();

            $user = $request->user();

            $adSets = $validated['adSets'];
            $campaignId = $validated['campaignId'];
            $websiteUrl = $validated['websiteUrl'];
            $pixelId = $validated['pixelId'];
            $facebookPageId = $validated['facebookPageId'];
            $instagramPageId = $validated['instagramPageId'];
            $settings = $validated['settings'];
            $hasSelectedAdSet = $validated['hasSelectedAdSet'];
            $utmParameters = $validated['utmParameters'];

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
                'user_id' => $user->id,
                'ad_account_id' => $adAccount->id,
            ]);

            $jobs = [];

            // Dispatch queue jobs
            foreach ($adSets as $adSetIndex => $adSet) {
                if (! $hasSelectedAdSet) {
                    $jobs[] = new CreateAdSet(
                        adCreationFlow: $flow,
                        adSetIndex: $adSetIndex,
                        input: new AdSetInput(
                            label: $adSet['label'],
                            countries: $adSet['settings']['locations'],
                            minAge: $adSet['settings']['age'][0],
                            maxAge: $adSet['settings']['age'][1],
                            gender: $adSet['settings']['gender'],
                            startDate: Carbon::parse($adSet['settings']['startDate'])
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
                        websiteUrl: is_null($websiteUrl) ? 'https://google.com' : $websiteUrl, // TODO: Get default from ad account settings if null
                        instagramPageId: $instagramPageId,
                        cta: $creative['settings']['cta'],
                        primaryTexts: array_unique(array_filter($creative['settings']['primaryTexts'])),
                        headlines: array_unique(array_filter($creative['settings']['headlines'])),
                        descriptions: array_unique(array_filter($creative['settings']['descriptions'])),
                        disableEnhancements: $settings['disableEnhancements'],
                        disableMultiAds: $settings['disableMultiAds'],
                        utmParameters: $utmParameters ?? null
                    );
                    $jobs[] = new CreateAd(
                        adCreationFlow: $flow,
                        adSetIndex: $adSetIndex,
                        creativeIndex: $creativeIndex,
                        label: $creative['label'],
                        pausedByDefault: $settings['pausedByDefault']
                    );
                }
            }

            $jobs[] = new AdCreationFlowCompleted(
                adCreationFlow: $flow,
                user: $user
            );

            Bus::chain($jobs)->dispatch();

            return response()->json($flow);
        } catch (Throwable $e) {
            foreach ($allPaths as $path) {
                if ($disk->exists($path)) {
                    $disk->delete($path);
                }
            }

            throw $e;
        }
    }
}
