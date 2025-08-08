<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function verify(Request $request)
    {
        // https://developers.facebook.com/docs/marketing-api/ad-rules/guides/trigger-based-rules#webhooks
        // This works and should be setup correctly but we still need to create 'PING_ENDPOINT' ad rules apparently - for each ad account

        $mode = $request->query('hub_mode');
        $challenge = $request->query('hub_challenge');
        $token = $request->query('hub_verify_token');

        if (! isset($mode) || ! isset($token)) {
            abort(403);
        }

        if ($mode !== 'subscribe' || $token !== 'eeBvqGkygTW7eCPVz92gaJKRCMNuLrpp6QuyHoKu') {
            abort(403);
        }

        return response($challenge, 200);
    }

    public function webhook(Request $request)
    {
        Log::debug($request);

        return response('OK', 200);
    }
}
