<?php

namespace App\Data;

use Spatie\LaravelData\Attributes\MapInputName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Mappers\SnakeCaseMapper;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
#[MapInputName(SnakeCaseMapper::class)]
class InsightsData extends Data
{
    public string $campaignId;

    public string $adsetId;

    public string $adId;

    public float $cpm;

    #[MapInputName('cost_per_inline_link_click')]
    public float $cpc;
}
