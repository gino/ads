<?php

namespace App\Http\Integrations\Requests\Traits;

use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

trait FilteringByDate
{
    protected string|array|null $dateFrom;

    protected string|array|null $dateTo;

    // Meta API limitation: 37 months maximum range
    protected int $maxMonthsRange = 37;

    public function setDateRange(string|array|null $dateFrom, string|array|null $dateTo): void
    {
        $this->dateFrom = $dateFrom;
        $this->dateTo = $dateTo;
    }

    public function getDateFrom(): string|array|null
    {
        return $this->dateFrom;
    }

    public function getDateTo(): string|array|null
    {
        return $this->dateTo;
    }

    public function getFormattedDateFrom()
    {
        $fallback = Carbon::today()->format('Y-m-d');
        $dateFrom = Carbon::parse($this->dateFrom ?? $fallback);
        $dateTo = $this->dateTo ? Carbon::parse($this->dateTo) : null;

        return $this->clampDateRange($dateFrom, $dateTo)['from'];
    }

    public function getFormattedDateTo()
    {
        $fallback = Carbon::today()->format('Y-m-d');
        $dateTo = Carbon::parse($this->dateTo ?? $fallback);
        $dateFrom = $this->dateFrom ? Carbon::parse($this->dateFrom) : null;

        return $this->clampDateRange($dateFrom, $dateTo)['to'];
    }

    protected function clampDateRange(?Carbon $dateFrom = null, ?Carbon $dateTo = null): array
    {
        $today = Carbon::today();
        $maxFromDate = $today->copy()->subMonths($this->maxMonthsRange);

        // Handle dateFrom
        if ($dateFrom) {
            $originalFrom = $dateFrom->format('Y-m-d');

            if ($dateFrom->lt($maxFromDate)) {
                $dateFrom = $maxFromDate->copy();

                // Log when date range is adjusted
                Log::info('Date range adjusted for API limits', [
                    'original_from' => $originalFrom,
                    'adjusted_from' => $dateFrom->format('Y-m-d'),
                    'max_months_range' => $this->maxMonthsRange,
                ]);
            }

            // Clamp future "from" dates to today
            if ($dateFrom->gt($today)) {
                $dateFrom = $today->copy();

                Log::info('Date range adjusted for API limits', [
                    'original_from' => $originalFrom,
                    'adjusted_from' => $dateFrom->format('Y-m-d'),
                    'reason' => 'Date cannot be in the future',
                ]);
            }
        }

        // Handle dateTo
        if ($dateTo) {
            $originalTo = $dateTo->format('Y-m-d');

            if ($dateTo->gt($today)) {
                $dateTo = $today->copy();

                // Log when date range is adjusted
                Log::info('Date range adjusted for API limits', [
                    'original_to' => $originalTo,
                    'adjusted_to' => $dateTo->format('Y-m-d'),
                    'reason' => 'Date cannot be in the future',
                ]);
            }
        }

        // Ensure ordering: since (from) must be <= until (to)
        if ($dateFrom && $dateTo && $dateFrom->gt($dateTo)) {
            $originalFrom = $dateFrom->format('Y-m-d');
            $dateFrom = $dateTo->copy();

            Log::info('Date range adjusted for ordering', [
                'original_from' => $originalFrom,
                'to' => $dateTo->format('Y-m-d'),
                'adjusted_from' => $dateFrom->format('Y-m-d'),
                'reason' => 'from cannot be after to',
            ]);
        }

        return [
            'from' => $dateFrom ? $dateFrom->format('Y-m-d') : null,
            'to' => $dateTo ? $dateTo->format('Y-m-d') : null,
        ];
    }
}
