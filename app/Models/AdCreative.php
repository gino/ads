<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class AdCreative extends Model
{
    use HasUlids;

    protected $fillable = [
        'external_id',
        //
        'ad_id',
    ];

    public function ad()
    {
        return $this->belongsTo(Ad::class);
    }
}
