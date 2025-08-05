<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class Connection extends Model
{
    use HasUlids;

    protected $fillable = [
        'access_token',
        'refresh_token',
        'user_id',
        'expires_at',
        'renewed_at',
        'last_synced_at',
    ];

    protected $hidden = [
        'access_token',
        'refresh_token',
    ];

    protected function casts()
    {
        return [
            'access_token' => 'encrypted',
            'refresh_token' => 'encrypted',
            'expires_at' => 'datetime',
            'renewed_at' => 'datetime',
            'last_synced_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function adAccounts()
    {
        return $this->hasMany(AdAccount::class);
    }
}
