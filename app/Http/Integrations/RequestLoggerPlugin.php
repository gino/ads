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

            $cached = method_exists($response, 'isCached') && $response->isCached();

            Log::info($cached ? 'Saloon (cached) request completed' : 'Saloon (NOT cached) request completed', [
                'request' => get_class($request),
                'method' => $request->getMethod(),
                'url' => $request->resolveEndpoint(),
                'status' => $response->status(),
                'cached' => $cached,
                'body' => $response->body(),
                'successful' => $response->successful(),
            ]);
        });
    }
}
