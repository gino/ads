<?php

namespace App\Data;

use Spatie\LaravelData\Attributes\MapInputName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Mappers\SnakeCaseMapper;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
#[MapInputName(SnakeCaseMapper::class)]
class AdCampaignData extends Data
{
    public string $id;

    public string $name;

    public string $effectiveStatus;

    public string $status;

    public ?string $dailyBudget;

    public ?InsightsData $insights;
}
