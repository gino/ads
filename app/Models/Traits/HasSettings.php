<?php

namespace App\Models\Traits;

use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

// https://chatgpt.com/c/68f4de2c-fef4-8330-9957-120688f67f47

trait HasSettings
{
    protected function cacheKey(): string
    {
        return "ad_account:{$this->id}:settings";
    }

    protected function cacheTtl(): Carbon
    {
        return now()->addHours(1);
    }

    public function getSetting(string $key, mixed $default = null)
    {
        $settings = $this->getSettings();

        return $settings[$key] ?? $default;
    }

    public function getSettings(?array $keys = null): array
    {
        $settings = Cache::remember($this->cacheKey(), $this->cacheTtl(), function () {
            return $this->settings()->pluck('value', 'key')->toArray();
        });

        if ($keys === null) {
            return $settings;
        }

        return array_merge(array_fill_keys($keys, null), array_intersect_key($settings, array_flip($keys)));
    }

    public function setSetting(string $key, mixed $value): void
    {
        $this->setSettings([$key => $value]);
    }

    public function setSettings(array $settings): void
    {
        $upsertData = [];
        $deleteKeys = [];

        foreach ($settings as $key => $value) {
            if ($value === null || $value === '') {
                $deleteKeys[] = $key;

                continue;
            }

            $upsertData[] = [
                'ad_account_id' => $this->id,
                'key' => $key,
                'value' => json_encode($value),
            ];
        }

        if (! empty($deleteKeys)) {
            $this->settings()->whereIn('key', $deleteKeys)->delete();
        }

        if (! empty($upsertData)) {
            $this->settings()->upsert(
                $upsertData,
                ['ad_account_id', 'key'],
                ['value', 'updated_at']
            );
        }

        // Invalidate cache after any change
        Cache::forget($this->cacheKey());
    }
}
