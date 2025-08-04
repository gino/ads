<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class Connection extends Model
{
    use HasUlids;

    protected $fillable = [
        'type',
        'access_token',
        'refresh_token',
        'user_id',
        'expires_at',
        'renewed_at',
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
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
