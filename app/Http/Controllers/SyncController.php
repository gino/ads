<?php

namespace App\Http\Controllers;

use App\Jobs\Meta\Sync;
use App\Jobs\Meta\SyncAdAccounts;
use App\Jobs\Meta\SyncAdCampaigns;
use App\Jobs\Meta\SyncAds;
use App\Jobs\Meta\SyncAdSets;
use App\SyncType;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Bus;

class SyncController extends Controller
{
    // Refresh/sync cooldowns - in minutes
    protected array $cooldowns = [
        SyncType::AD_ACCOUNTS->value => 10,
        SyncType::AD_CAMPAIGNS->value => 10,
        SyncType::AD_SETS->value => 10,
        SyncType::ADS->value => 10,
    ];

    protected array $jobs = [
        SyncType::AD_ACCOUNTS->value => SyncAdAccounts::class,
        SyncType::AD_CAMPAIGNS->value => SyncAdCampaigns::class,
        SyncType::AD_SETS->value => SyncAdSets::class,
        SyncType::ADS->value => SyncAds::class,
    ];

    public function sync(?SyncType $type = null)
    {
        $user = Auth::user();
        $connection = $user->connection;

        if (is_null($type)) {
            // Check cooldown for all sync types
            $cooldown = $this->checkCooldowns($connection, array_keys($this->cooldowns));
            if ($cooldown['is_blocked']) {
                return response()->json([
                    'message' => "Please wait {$cooldown['seconds_left']} seconds before syncing again.",
                    'retry_after' => $cooldown['seconds_left'],
                    'type' => $cooldown['type'],
                ], 429);
            }

            Bus::chain([
                new SyncAdAccounts($connection),
                new SyncAdCampaigns($connection),
                new SyncAdSets($connection),
                new SyncAds($connection),
            ])->dispatch();
            $this->updateLastSyncedTimes($connection, array_keys($this->cooldowns));

            return response('OK', 200);
        }

        $typeValue = $type->value;

        if (! array_key_exists($typeValue, $this->jobs)) {
            return response('Invalid sync type', 422);
        }

        // Check cooldown for specific sync type
        $cooldown = $this->checkCooldowns($connection, [$typeValue]);
        if ($cooldown['is_blocked']) {
            return response()->json([
                'message' => "Please wait {$cooldown['seconds_left']} seconds before syncing '{$typeValue}' again.",
                'retry_after' => $cooldown['seconds_left'],
                'type' => $typeValue,
            ], 429);
        }

        $this->jobs[$typeValue]::dispatch($connection);
        $this->updateLastSyncedTimes($connection, [$typeValue]);

        return response('OK', 200);
    }

    /**
     * Checks cooldowns for the given sync types on the connection.
     * Returns a 429 JSON response if any cooldown active, otherwise null.
     */
    private function checkCooldowns($connection, array $syncTypes): array
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

                    return [
                        'is_blocked' => true,
                        'seconds_left' => $secondsLeft,
                        'type' => $syncTypeValue, // return the exact sync type causing the block
                    ];
                }
            }
        }

        return [
            'is_blocked' => false,
            'seconds_left' => 0,
            'type' => null,
        ];
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
