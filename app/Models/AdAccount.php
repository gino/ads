<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class AdAccount extends Model
{
    use HasUlids;

    protected $fillable = [
        'account_id',
        'name',
        'currency',
        'connection_id',
    ];

    public function connection()
    {
        return $this->belongsTo(Connection::class);
    }
}
