<?php

namespace App\Http\Integrations\Requests\Traits;

use App\Http\Integrations\Requests\Exceptions\MetaRateLimitException;
use Illuminate\Support\Facades\Log;
use Saloon\Enums\PipeOrder;
use Saloon\Http\PendingRequest;
use Saloon\Http\Response;

trait HasMetaRateLimit
{
    protected array $metaRateLimitCodes = [4, 17, 32, 613, 80004, 80000, 80003, 80002, 80005, 80006, 32, 80001, 80008, 80014, 80009];

    public function bootHasMetaRateLimit(PendingRequest $pendingRequest): void
    {
        $pendingRequest->middleware()->onResponse(
            function (Response $response): void {
                $request = $response->getRequest();

                if ($response->isCached()) {
                    Log::debug('No rate limit from Meta - request was cached - ignoring...', [
                        'cached' => $response->isCached(),
                        'request' => get_class($request),
                        'method' => $request->getMethod(),
                        'url' => $request->resolveEndpoint(),
                        'status' => $response->status(),
                    ]);

                    return;
                }

                $status = $response->status();
                $error = $response->json('error') ?? [];

                $isRateLimited =
                    $status === 429 ||
                    ($status === 400 && in_array($error['code'] ?? null, $this->metaRateLimitCodes ?? [], true));

                if ($isRateLimited) {
                    Log::warning('Meta API rate limit encountered', [
                        'status' => $status,
                        'code' => $error['code'] ?? null,
                        'message' => $error['message'] ?? null,
                        'endpoint' => $request->resolveEndpoint(),
                    ]);

                    throw new MetaRateLimitException(
                        'Meta API rate limit encountered: '.($error['message'] ?? 'Unknown'),
                        $request,
                        $response
                    );
                } else {
                    Log::debug('No rate limit from Meta', [
                        'request' => get_class($request),
                        'method' => $request->getMethod(),
                        'url' => $request->resolveEndpoint(),
                        'status' => $response->status(),
                    ]);
                }
            },
            order: PipeOrder::LAST
        );
    }
}
