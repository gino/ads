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
        Schema::create('ad_accounts', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('external_id')->unique();
            $table->string('name');
            $table->string('currency');
            $table->integer('status');
            $table->string('timezone');
            $table->decimal('timezone_offset_utc', 4, 2);
            $table->string('business_id')->nullable();
            $table->foreignUlid('connection_id')->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ad_accounts');
    }
};
