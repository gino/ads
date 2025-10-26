<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class WebhooksController extends Controller
{
    public function verify(Request $request)
    {
        // https://developers.facebook.com/docs/graph-api/webhooks/getting-started
    }

    public function callback(Request $request)
    {
        // https://developers.facebook.com/docs/graph-api/webhooks/getting-started/webhooks-for-ad-accounts
    }
}
