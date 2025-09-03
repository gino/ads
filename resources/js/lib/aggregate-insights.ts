interface InsightSums {
    spend: number;
    cpc: number;
    cpm: number;
    ctr: number;
    clicks: number;
    impressions: number;
    atc: number;
    conversions: number;
    cpa: number;
    roas: number;
}

// https://chatgpt.com/c/68b827eb-ee6c-8330-9d88-6fe48c10b6b8

export function aggregateInsights<
    T extends { insights: App.Data.InsightsData | null }[]
>(data: T): InsightSums {
    if (!data) {
        return {
            spend: 0,
            cpc: 0,
            cpm: 0,
            ctr: 0,
            clicks: 0,
            impressions: 0,
            atc: 0,
            conversions: 0,
            cpa: 0,
            roas: 0,
        };
    }

    const spend = data.reduce((a, b) => a + (b.insights?.spend || 0), 0);
    const clicks = data.reduce((a, b) => a + (b.insights?.clicks || 0), 0);
    const impressions = data.reduce(
        (a, b) => a + (b.insights?.impressions || 0),
        0
    );
    const cpc = spend / clicks;
    const cpm = (spend / impressions) * 1000;
    const ctr = (clicks / impressions) * 100;
    const atc = data.reduce((a, b) => a + (b.insights?.atc || 0), 0);
    const conversions = data.reduce(
        (a, b) => a + (b.insights?.conversions || 0),
        0
    );
    const cpa = Math.min(spend / conversions, 0);

    return {
        spend,
        cpc,
        cpm,
        ctr,
        clicks,
        impressions,
        atc,
        conversions,
        cpa,
        roas: 0,
    };
}
