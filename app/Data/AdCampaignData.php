<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class AdCampaignData extends Data
{
    public string $id;

    public string $name;

    public string $status;
}
