<?php

namespace App\Models\Traits;

trait HasSettings
{
    public function getSetting(string $key, mixed $default = null)
    {
        return $this->settings()->where('key', $key)->first()?->value ?? $default;
    }

    public function getSettings(?array $keys = null): array
    {
        $query = $this->settings();

        if ($keys !== null) {
            $query->whereIn('key', $keys);
        }

        $data = $query->get()->pluck('value', 'key')->toArray();

        if ($keys !== null) {
            $data = array_merge(array_fill_keys($keys, null), $data);
        }

        return $data;
    }

    public function setSetting(string $key, mixed $value): void
    {
        $this->settings()->updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
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
    }
}
