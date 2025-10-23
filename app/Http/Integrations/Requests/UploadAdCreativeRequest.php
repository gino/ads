<?php

namespace App\Http\Integrations\Requests;

use App\Http\Integrations\Requests\Traits\HasRateLimits;
use App\Models\AdAccount;
use Saloon\Contracts\Body\HasBody;
use Saloon\Data\MultipartValue;
use Saloon\Enums\Method;
use Saloon\Http\Request;
use Saloon\Traits\Body\HasMultipartBody;

// https://developers.facebook.com/docs/marketing-api/reference/ad-image/#Creating

class UploadAdCreativeRequest extends Request implements HasBody
{
    use HasMultipartBody, HasRateLimits;

    protected Method $method = Method::POST;

    protected AdAccount $adAccount;

    protected $creative;

    protected string $filename;

    protected string $label;

    protected bool $isVideo;

    public function __construct(
        AdAccount $adAccount,
        $creative,
        string $filename,
        string $label,
        ?bool $isVideo
    ) {
        $this->adAccount = $adAccount;
        $this->creative = $creative;
        $this->filename = $filename;
        $this->label = $label;
        $this->isVideo = $isVideo;
    }

    public function resolveEndpoint(): string
    {
        if ($this->isVideo) {
            return "{$this->adAccount->external_id}/advideos";
        }

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

    protected function getLimiterPrefix(): ?string
    {
        return "ad-account-id-{$this->adAccount->id}";
    }
}
