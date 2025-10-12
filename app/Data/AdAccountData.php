<?php

namespace App\Data;

use Spatie\LaravelData\Attributes\MapInputName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Mappers\SnakeCaseMapper;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
#[MapInputName(SnakeCaseMapper::class)]
class AdAccountData extends Data
{
    public string $id;

    public string $name;

    public string $currency;

    public string $status;

    public string $externalId;

    public ?string $businessId;
}
