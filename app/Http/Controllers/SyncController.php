<?php

namespace App\Http\Controllers;

use App\Jobs\Meta\Sync;
use App\Jobs\Meta\SyncAdAccounts;
use App\Jobs\Meta\SyncAdCampaigns;
use App\Jobs\Meta\SyncAdSets;
use App\SyncType;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class SyncController extends Controller
{
    // Refresh/sync cooldowns - in minutes
    protected array $cooldowns = [
        SyncType::AD_ACCOUNTS->value => 10,
        SyncType::AD_CAMPAIGNS->value => 10,
        SyncType::AD_SETS->value => 10,
    ];

    public function sync(?SyncType $type = null)
    {
        $user = Auth::user();
        $connection = $user->connection;

        if (is_null($type)) {
            // Check cooldown for all sync types
            $blocked = $this->checkCooldowns($connection, array_keys($this->cooldowns));
            if ($blocked !== null) {
                return $blocked;
            }

            Sync::dispatch($connection);

            $this->updateLastSyncedTimes($connection, array_keys($this->cooldowns));

            return response('OK', 200);
        }

        $jobs = [
            SyncType::AD_ACCOUNTS->value => SyncAdAccounts::class,
            SyncType::AD_CAMPAIGNS->value => SyncAdCampaigns::class,
            SyncType::AD_SETS->value => SyncAdSets::class,
        ];

        $typeValue = $type->value;

        if (! array_key_exists($typeValue, $jobs)) {
            return response('Invalid sync type', 422);
        }

        // Check cooldown for specific sync type
        $blocked = $this->checkCooldowns($connection, [$typeValue]);
        if ($blocked !== null) {
            return $blocked;
        }

        $jobs[$typeValue]::dispatch($connection);

        $this->updateLastSyncedTimes($connection, [$typeValue]);

        return response('OK', 200);
    }

    /**
     * Checks cooldowns for the given sync types on the connection.
     * Returns a 429 JSON response if any cooldown active, otherwise null.
     */
    private function checkCooldowns($connection, array $syncTypes)
    {
        foreach ($syncTypes as $syncTypeValue) {
            $lastSyncedAt = $connection->last_synced[$syncTypeValue] ?? null;

            if ($lastSyncedAt) {
                if (! $lastSyncedAt instanceof Carbon) {
                    $lastSyncedAt = Carbon::parse($lastSyncedAt);
                }

                $cooldownMinutes = $this->cooldowns[$syncTypeValue] ?? 0;
                $nextAvailableAt = $lastSyncedAt->copy()->addMinutes($cooldownMinutes);

                if ($nextAvailableAt->isFuture()) {
                    $secondsLeft = now()->diffInSeconds($nextAvailableAt);

                    return response()->json([
                        'message' => "Please wait {$secondsLeft} seconds before syncing '{$syncTypeValue}' again.",
                        'retry_after' => $secondsLeft,
                    ], 429);
                }
            }
        }

        return null;
    }

    /**
     * Updates the last_synced timestamps for the given sync types.
     */
    private function updateLastSyncedTimes($connection, array $syncTypes): void
    {
        $lastSynced = $connection->last_synced;

        foreach ($syncTypes as $syncTypeValue) {
            $lastSynced[$syncTypeValue] = now();
        }

        $connection->last_synced = $lastSynced;
        $connection->save();
    }
}
