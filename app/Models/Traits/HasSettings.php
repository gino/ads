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
        $data = [];

        foreach ($settings as $key => $value) {
            $data[] = [
                'key' => $key,
                'value' => json_encode($value),
                'ad_account_id' => $this->id,
            ];
        }

        $this->settings()->upsert(
            $data,
            ['ad_account_id', 'key'],
            ['value', 'updated_at']
        );
    }
}
