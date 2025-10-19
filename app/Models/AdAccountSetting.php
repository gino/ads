<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class AdAccountSetting extends Model
{
    use HasUlids;

    protected $fillable = [
        'key',
        'value',
        'ad_account_id',
    ];

    protected $casts = [
        'value' => 'array',
    ];

    public function adAccounts()
    {
        return $this->belongsTo(AdAccount::class);
    }
}
