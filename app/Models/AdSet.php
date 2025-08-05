<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class AdSet extends Model
{
    use HasUlids;

    protected $fillable = [
        'external_id',
        'name',
        'status',
        'ad_campaign_id',
    ];

    public function adCampaign()
    {
        return $this->belongsTo(AdCampaign::class);
    }
}
