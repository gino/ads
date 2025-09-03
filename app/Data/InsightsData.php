<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class InsightsData extends Data
{
    public function __construct(
        public ?string $campaignId,
        public ?string $adsetId,
        public ?string $adId,
        public ?float $spend,
        public ?float $cpm,
        public ?float $cpc,
        public ?float $ctr,
        public ?int $clicks,
        public ?int $impressions,
        public ?int $conversions,
        public ?int $atc,
        public ?float $cpa,
        public ?float $roas,
    ) {}

    public static function fromRaw(array $data): self
    {
        // dd($data);

        $actions = collect($data['actions'] ?? []);

        $conversions = (int) ($actions->firstWhere('action_type', 'purchase')['value'] ?? 0);
        $addToCarts = (int) ($actions->firstWhere('action_type', 'add_to_cart')['value'] ?? 0);

        $roas = null;
        if (! empty($data['purchase_roas'])) {
            $roas = collect($data['purchase_roas'])->firstWhere('action_type', 'purchase')['value'];
        }

        return new self(
            campaignId: $data['campaign_id'] ?? null,
            adsetId: $data['adset_id'] ?? null,
            adId: $data['ad_id'] ?? null,
            spend: $data['spend'] ?? null,
            cpm: $data['cpm'] ?? null,
            cpc: $data['cost_per_inline_link_click'] ?? null,
            ctr: $data['inline_link_click_ctr'] ?? null,
            clicks: $data['inline_link_clicks'] ?? null,
            impressions: $data['impressions'] ?? null,
            conversions: $conversions ?? null,
            atc: $addToCarts ?? null,
            cpa: $data['cost_per_objective_result'] ?? null,
            roas: $roas ?? null,
        );
    }
}
