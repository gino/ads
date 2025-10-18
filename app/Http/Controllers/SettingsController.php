<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class SettingsController extends Controller
{
    public function account()
    {
        return Inertia::render('settings/account');
    }
}
