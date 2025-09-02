<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class TestController extends Controller
{
    public function view()
    {
        return Inertia::render('test', [
            'test' => Inertia::defer(function () {
                sleep(1);

                return [
                    'foo' => 'bar',
                    'bar' => 'foo',
                ];
            }),
        ]);
    }

    public function update()
    {
        sleep(3);

        return response()->json(['foo' => 'bar']);
        // return back()->with([]);
    }
}
