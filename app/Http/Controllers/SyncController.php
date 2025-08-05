<?php

namespace App\Http\Controllers;

use App\Jobs\Meta\Sync;
use App\Jobs\Meta\SyncAdAccounts;
use App\Jobs\Meta\SyncAdCampaigns;
use App\Jobs\Meta\SyncAdSets;
use Illuminate\Support\Facades\Auth;

class SyncController extends Controller
{
    public function sync(?string $type = null)
    {
        $user = Auth::user();

        if (is_null($type)) {
            Sync::dispatch($user->connection);

            return response('OK', 200);
        }

        switch ($type) {
            case 'ad-accounts':
                SyncAdAccounts::dispatch($user->connection);
                break;
            case 'ad-campaigns':
                SyncAdCampaigns::dispatch($user->connection);
                break;
            case 'ad-sets':
                SyncAdSets::dispatch($user->connection);
                break;
            default:
                return response('Invalid sync type', 422);
        }

        return response('OK', 200);
    }
}
