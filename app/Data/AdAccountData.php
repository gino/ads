<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class AdAccountData extends Data
{
    public string $id;

    public string $name;

    public string $currency;

    public string $status;

    public string $externalId;
}
