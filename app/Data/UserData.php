<?php

namespace App\Data;

use Carbon\Carbon;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class UserData extends Data
{
    public string $id;

    public string $name;

    public string $email;

    public string $avatar;

    public Carbon $createdAt;
}
