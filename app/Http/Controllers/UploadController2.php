<?php

namespace App\Http\Controllers;

use App\Http\Integrations\MetaConnector;
use App\Http\Integrations\Requests\CreateAdCreativeRequest;
use App\Http\Integrations\Requests\CreateAdRequest;
use App\Http\Integrations\Requests\UploadAdCreativeRequest;
use App\Http\Integrations\Requests\UploadAdVideoCreativeRequest;
use App\Models\AdAccount;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\File;

class UploadController2 extends Controller
{
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
