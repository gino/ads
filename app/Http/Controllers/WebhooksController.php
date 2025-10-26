<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class WebhooksController extends Controller
{
    public function verify(Request $request)
    {
        // https://developers.facebook.com/docs/graph-api/webhooks/getting-started
        $challenge = $request->query('hub_challenge');
        $token = $request->query('hub_verify_token');

        if ($token !== config('services.facebook.webhook_verification_token')) {
            abort(401);
        }

        return response($challenge);
    }

    public function callback(Request $request)
    {
        // https://developers.facebook.com/apps/3806782732904592/webhooks/?business_id=1141698257602777
        // https://developers.facebook.com/docs/graph-api/webhooks/getting-started/webhooks-for-ad-accounts
    }
}
