<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ViewController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('index', [
            'adCampaigns' => [],
        ]);
    }

    public function login()
    {
        return Inertia::render('login');
    }
}
