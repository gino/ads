<?php

namespace App\Http\Middleware;

use App\Data\AdAccountData;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class HandleSelectedAdAccount
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $adAccounts = $request->user()->connection->adAccounts()->get();

        // https://github.com/gino/elevate/blob/main/app/Http/Middleware/EnsurePageSelected.php
        $sessionKey = 'selected_ad_account_id';
        $selectable = $adAccounts->contains(function ($adAccount) use ($request, $sessionKey) {
            return $adAccount->id === $request->session()->get($sessionKey);
        });

        if (! $request->session()->has($sessionKey) || ! $selectable) {
            $request->session()->put($sessionKey, $adAccounts->first()->id);
        }

        Inertia::share('selectedAdAccountId', fn () => $request->session()->get($sessionKey));
        Inertia::share('adAccounts', function () use ($adAccounts) {
            return AdAccountData::collect($adAccounts);
        });

        return $next($request);
    }
}
