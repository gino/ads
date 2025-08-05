<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('connections', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->longText('access_token');
            $table->longText('refresh_token')->nullable();
            $table->foreignUlid('user_id')->index();
            $table->timestamp('expires_at');
            $table->timestamp('renewed_at')->nullable();
            $table->json('last_synced')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('connections');
    }
};
