<?php

namespace App\Http\Integrations;

use Illuminate\Support\Facades\Log;
use Saloon\Http\Connector;
use Saloon\Http\Response;

class RequestLoggerPlugin
{
    public static function boot(Connector $connector): void
    {
        $connector->middleware()->onResponse(function (Response $response) {
            $request = $response->getRequest();

            Log::info('Saloon request completed', [
                'request' => get_class($request),
                'method' => $request->getMethod(),
                'url' => $request->resolveEndpoint(),
                'status' => $response->status(),
                'cached' => method_exists($response, 'isCached') && $response->isCached(),
                'body' => $response->body(),
                'successful' => $response->successful(),
            ]);
        });
    }
}
