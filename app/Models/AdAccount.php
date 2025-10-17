<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AdAccount extends Model
{
    use HasUlids, SoftDeletes;

    protected $fillable = [
        'external_id',
        'name',
        'currency',
        'connection_id',
        'status',
        'business_id',
        'timezone',
        'timezone_offset_utc',
    ];

    public function connection()
    {
        return $this->belongsTo(Connection::class);
    }

    public function adCreationFlows()
    {
        return $this->hasMany(AdCreationFlow::class);
    }

    public function isActive()
    {
        return $this->status === 'active';
    }

    public function getStatusAttribute($status)
    {
        return match ($status) {
            1 => 'active',
            default => 'inactive'
        };
    }
}
