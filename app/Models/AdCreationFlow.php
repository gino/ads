<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class AdCreationFlow extends Model
{
    // https://chatgpt.com/c/68e91b71-5a90-8333-9754-1fc69900048d
    use HasUlids;

    protected $fillable = [
        'adSets',
        'status',
        'user_id',
        'ad_account_id',
    ];

    protected $casts = [
        'adSets' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function adAccount()
    {
        return $this->belongsTo(AdAccount::class);
    }
}
