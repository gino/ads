<?php

namespace App\Http\Controllers;

use App\Http\Integrations\MetaConnector;
use App\Http\Integrations\Requests\GetAdCampaignsRequest;
use App\Models\AdAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ViewController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('index');
    }

    public function campaigns(Request $request)
    {
        // We wanna somehow refactor this line of code - maybe on the Request interface $request->selectedAdAccount() or $request->selectedAdAccountId()
        $selectedAdAccount = AdAccount::find($request->session()->get('selected_ad_account_id'));

        $meta = new MetaConnector($request->user()->connection);
        $paginator = $meta->paginate(new GetAdCampaignsRequest($selectedAdAccount));

        return $paginator->collect()->all();

        return Inertia::render('campaigns', [
            'adCampaigns' => [],
        ]);
    }

    public function login()
    {
        return Inertia::render('login');
    }
}
