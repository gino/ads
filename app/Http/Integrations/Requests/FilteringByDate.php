<?php

namespace App\Http\Integrations\Requests;

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

        return $this->clampDateRange($dateFrom, null)['from'];
    }

    public function getFormattedDateTo()
    {
        $fallback = Carbon::today()->format('Y-m-d');
        $dateTo = Carbon::parse($this->dateTo ?? $fallback);

        return $this->clampDateRange(null, $dateTo)['to'];
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

        return [
            'from' => $dateFrom ? $dateFrom->format('Y-m-d') : null,
            'to' => $dateTo ? $dateTo->format('Y-m-d') : null,
        ];
    }
}
