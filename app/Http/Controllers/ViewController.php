<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class ViewController extends Controller
{
    public function index()
    {
        return Inertia::render('index');
    }

    public function login()
    {
        return Inertia::render('login');
    }
}
