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
        Schema::create('ad_creation_flows', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->json('adSets')->default('[]');
            $table->string('status')->default('pending');
            $table->foreignUlid('user_id')->index();
            $table->foreignUlid('ad_account_id')->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ad_creation_flows');
    }
};
