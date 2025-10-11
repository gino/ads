<?php

namespace App\Http\Integrations\Requests;

use App\Models\AdAccount;
use Saloon\Contracts\Body\HasBody;
use Saloon\Data\MultipartValue;
use Saloon\Enums\Method;
use Saloon\Http\Request;
use Saloon\Traits\Body\HasMultipartBody;

// https://developers.facebook.com/docs/marketing-api/reference/ad-image/#Creating

class UploadAdCreativeRequest extends Request implements HasBody
{
    use HasMultipartBody;

    protected Method $method = Method::POST;

    protected AdAccount $adAccount;

    protected $creative;

    protected string $filename;

    protected string $label;

    public function __construct(
        AdAccount $adAccount,
        $creative,
        string $filename,
        string $label
    ) {
        $this->adAccount = $adAccount;
        $this->creative = $creative;
        $this->filename = $filename;
        $this->label = $label;
    }

    public function resolveEndpoint(): string
    {
        return "{$this->adAccount->external_id}/adimages";
    }

    protected function defaultBody(): array
    {
        return [
            new MultipartValue(
                name: 'creative',
                value: $this->creative,
                filename: "{$this->label}.".pathinfo($this->filename, PATHINFO_EXTENSION)
            ),
        ];
    }
}
