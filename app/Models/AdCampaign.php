<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class AdCampaign extends Model
{
    use HasUlids;

    protected $fillable = [
        'campaign_id',
        'name',
        'status',
        'ad_account_id',
    ];

    public function adAccount()
    {
        return $this->belongsTo(AdAccount::class);
    }
}
