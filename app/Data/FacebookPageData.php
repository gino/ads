<?php

namespace App\Data;

use Spatie\LaravelData\Attributes\MapInputName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Mappers\SnakeCaseMapper;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
#[MapInputName(SnakeCaseMapper::class)]
class FacebookPageData extends Data
{
    public string $id;

    public string $name;

    #[MapInputName('business.id')]
    public ?string $businessId;

    #[MapInputName('picture.data.url')]
    public ?string $picture;

    #[MapInputName('connected_instagram_account')]
    public ?InstagramAccountData $instagramAccount;
}
