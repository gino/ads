<?php

namespace App\Http\Integrations\Requests\Exceptions;

use Exception;
use Saloon\Http\Request;
use Saloon\Http\Response;

class MetaRateLimitException extends Exception
{
    public int $retryAfterSeconds;

    public Response $response;

    public Request $request;

    public function __construct(
        string $message,
        Request $request,
        Response $response,
        int $retryAfterSeconds
    ) {
        parent::__construct($message);
        $this->request = $request;
        $this->response = $response;
        $this->retryAfterSeconds = $retryAfterSeconds;
    }

    public function getRetryAfterSeconds()
    {
        return $this->retryAfterSeconds;
    }

    public function getRequest()
    {
        return $this->request;
    }

    public function getResponse()
    {
        return $this->response;
    }
}
