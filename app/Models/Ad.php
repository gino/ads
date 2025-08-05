<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class Ad extends Model
{
    use HasUlids;

    protected $fillable = [
        'external_id',
        //
        'ad_campaign_id',
    ];

    public function adSet()
    {
        return $this->belongsTo(AdSet::class);
    }
}
