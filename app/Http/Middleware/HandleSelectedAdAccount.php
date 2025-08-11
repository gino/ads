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

        $sessionKey = 'selected_ad_account_id';
        $currentId = $request->session()->get($sessionKey);

        $selectable = $adAccounts->contains(function ($adAccount) use ($currentId) {
            return $adAccount->id === $currentId && $adAccount->isActive();
        });

        if (! $currentId || ! $selectable) {
            $request->session()->put($sessionKey, $adAccounts->first()->id);
        }

        Inertia::share('selectedAdAccountId', fn () => $request->session()->get($sessionKey));
        Inertia::share('adAccounts', fn () => AdAccountData::collect($adAccounts));

        return $next($request);
    }
}
