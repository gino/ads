<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class Paginator
{
    public PendingRequest $client;

    public function __construct($client)
    {
        $this->client = $client;
    }

    /**
     * Fetch all paginated results from a Meta Graph API endpoint.
     */
    public function fetchAll(string $endpoint, array $params = []): array
    {
        $results = [];
        $url = $endpoint;
        $useFullUrl = false;

        do {
            if ($useFullUrl) {
                // Full next URL already includes everything
                $response = Http::get($url)->json();
            } else {
                // Use the Meta client for initial call
                $response = $this->client->get($url, $params);
            }

            $results = array_merge($results, $response['data'] ?? []);

            if (! empty($response['paging']['next'])) {
                $url = $response['paging']['next'];
                $useFullUrl = true;
                $params = []; // Not needed anymore
            } else {
                $url = null;
            }

        } while ($url);

        return $results;
    }

    // https://chatgpt.com/c/6890a030-0c9c-8327-b572-e5ff8180a1a8
    public function fetchEachBatch(string $endpoint, array $params, callable $callback): void
    {
        $url = $endpoint;
        $useFullUrl = false;

        do {
            if ($useFullUrl) {
                $response = Http::get($url)->json();
            } else {
                $response = $this->client->get($url, $params);

                if ($response->failed()) {
                    Log::error(json_encode($response->body()));
                }
            }

            $batch = $response['data'] ?? [];

            if (! empty($batch)) {
                $callback($batch); // Process the current batch here
            }

            if (! empty($response['paging']['next'])) {
                $url = $response['paging']['next'];
                $useFullUrl = true;
                $params = [];
            } else {
                $url = null;
            }
        } while ($url);
    }

    public function getClient()
    {
        return $this->client;
    }
}
