<?php

namespace App\Http\Integrations\Requests\Exceptions;

use Exception;
use Saloon\Http\Request;
use Saloon\Http\Response;

class MetaRateLimitException extends Exception
{
    public ?Response $response;

    public ?Request $request;

    public function __construct(string $message, ?Request $request = null, ?Response $response = null)
    {
        parent::__construct($message);
        $this->request = $request;
        $this->response = $response;
    }
}
