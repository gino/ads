<?php

namespace App\Casts;

use App\SyncType;
use ArrayAccess;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Support\Carbon;
use JsonSerializable;

class LastSynced implements ArrayAccess, CastsAttributes, JsonSerializable
{
    protected array $data = [];

    public function get($model, string $key, $value, array $attributes)
    {
        $this->data = json_decode($value ?? '{}', true);

        return $this;
    }

    public function set($model, string $key, $value, array $attributes)
    {
        return [
            $key => json_encode($value instanceof self ? $value->toArray() : $value),
        ];
    }

    public function offsetExists($offset): bool
    {
        $key = $offset instanceof SyncType ? $offset->value : $offset;

        return array_key_exists($key, $this->data);
    }

    public function offsetGet(mixed $offset): mixed
    {
        $key = $offset instanceof SyncType ? $offset->value : $offset;

        return isset($this->data[$key]) ? Carbon::parse($this->data[$key]) : null;
    }

    public function offsetSet($offset, $value): void
    {
        $key = $offset instanceof SyncType ? $offset->value : $offset;
        $this->data[$key] = $value instanceof Carbon ? $value->toISOString() : $value;
    }

    public function offsetUnset($offset): void
    {
        $key = $offset instanceof SyncType ? $offset->value : $offset;
        unset($this->data[$key]);
    }

    public function toArray(): array
    {
        return $this->data;
    }

    public function refresh(SyncType $type): void
    {
        $this[$type] = now();
    }

    public function jsonSerialize(): mixed
    {
        return $this->data ?: null;
    }
}
