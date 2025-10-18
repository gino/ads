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

        // Fallback to last_selected_ad_account_id
        if (! $currentId && $request->user()->last_selected_ad_account_id) {
            $currentId = $request->user()->last_selected_ad_account_id;
        }

        $selectable = $adAccounts->contains(function ($adAccount) use ($currentId) {
            return $adAccount->id === $currentId && $adAccount->isActive();
        });

        if (! $currentId || ! $selectable) {
            $currentId = $adAccounts->first()?->id;

            // There's one edge case to be aware of: if the user selected an ad account that later becomes inactive or gets deleted, your middleware will fall back to the first available account. But the database still has the old last_selected_ad_account_id.
            if ($currentId !== $request->user()->last_selected_ad_account_id) {
                $request->user()->update(['last_selected_ad_account_id' => $currentId]);
            }
        }

        $request->session()->put($sessionKey, $currentId);

        Inertia::share('selectedAdAccountId', fn () => $request->session()->get($sessionKey));
        Inertia::share('adAccounts', fn () => AdAccountData::collect($adAccounts));

        return $next($request);
    }
}
