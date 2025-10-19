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
        Schema::create('ad_account_settings', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('key');
            $table->json('value')->nullable();
            $table->foreignUlid('ad_account_id')->index();
            $table->timestamps();

            $table->unique(['ad_account_id', 'key']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ad_account_settings');
    }
};
