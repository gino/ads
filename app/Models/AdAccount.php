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
    ];

    public function connection()
    {
        return $this->belongsTo(Connection::class);
    }

    public function getStatusAttribute($status)
    {
        return match ($status) {
            1 => 'active',
            default => 'inactive'
        };
    }

    public function adCampaigns()
    {
        return $this->hasMany(AdCampaign::class);
    }
}
