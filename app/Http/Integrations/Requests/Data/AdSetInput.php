<?php

namespace App\Http\Integrations\Requests\Data;

use Spatie\LaravelData\Data;

class AdSetInput extends Data
{
    /** @param string[] $countries */
    public function __construct(
        public string $id,
        public string $label,
        public array $countries,
    ) {}
}
