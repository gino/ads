<?php

namespace App\Providers;

use App\Models\AdAccount;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Model::automaticallyEagerLoadRelationships();
        Model::preventLazyLoading(! app()->isProduction());

        Request::macro('selectedAdAccountId', function () {
            return $this->session()->get('selected_ad_account_id');
        });

        Request::macro('adAccount', function () {
            if (! property_exists($this, 'cachedSelectedAdAccount')) {
                $this->cachedSelectedAdAccount = null;

                if ($this->selectedAdAccountId()) {
                    $this->cachedSelectedAdAccount = AdAccount::find($this->selectedAdAccountId());
                }
            }

            return $this->cachedSelectedAdAccount;
        });
    }
}
