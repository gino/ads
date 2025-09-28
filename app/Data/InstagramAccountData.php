<?php

namespace App\Data;

use Spatie\LaravelData\Attributes\MapInputName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Mappers\SnakeCaseMapper;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
#[MapInputName(SnakeCaseMapper::class)]
class InstagramAccountData extends Data
{
    public string $id;

    public string $username;

    #[MapInputName('has_profile_pic')]
    public bool $hasProfilePicture;

    #[MapInputName('profile_picture_url')]
    public string $url;
}
