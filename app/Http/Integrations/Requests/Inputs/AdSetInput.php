<?php

namespace App\Http\Integrations\Requests\Inputs;

use Carbon\Carbon;
use Spatie\LaravelData\Data;

class AdSetInput extends Data
{
    /** @param string[] $countries */
    public function __construct(
        public string $label,
        public array $countries,
        public int $minAge,
        public int $maxAge,
        public string $gender,
        public Carbon $startDate,
    ) {}
}
