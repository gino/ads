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

/**
 * Safely divides two numbers, returning NaN if the result would be invalid
 * (division by zero, infinity, or no valid data)
 */
function safeDivide(numerator: number, denominator: number): number {
    // If numerator is 0 and denominator is 0, there's no meaningful data
    if (numerator === 0 && denominator === 0) {
        return NaN;
    }

    // If only denominator is 0, prevent division by zero
    if (denominator === 0) {
        return NaN;
    }

    const result = numerator / denominator;

    // Check for infinity or invalid results
    if (!isFinite(result)) {
        return NaN;
    }

    return result;
}

export function aggregateInsights<
    T extends { insights: App.Data.InsightsData | null }[]
>(data: T): InsightSums {
    // Return all NaN if no data provided
    if (!data || data.length === 0) {
        return {
            spend: NaN,
            cpc: NaN,
            cpm: NaN,
            ctr: NaN,
            clicks: NaN,
            impressions: NaN,
            atc: NaN,
            conversions: NaN,
            cpa: NaN,
            roas: NaN,
        };
    }

    // Aggregate raw metrics
    const spend = data.reduce(
        (acc, item) => acc + (item.insights?.spend || 0),
        0
    );
    const clicks = data.reduce(
        (acc, item) => acc + (item.insights?.clicks || 0),
        0
    );
    const impressions = data.reduce(
        (acc, item) => acc + (item.insights?.impressions || 0),
        0
    );
    const atc = data.reduce((acc, item) => acc + (item.insights?.atc || 0), 0);
    const conversions = data.reduce(
        (acc, item) => acc + (item.insights?.conversions || 0),
        0
    );

    // TODO: Couldn't do this yet:
    // https://chatgpt.com/c/68f34920-b504-832c-b433-7b87fbc454c6
    // const revenue = data.reduce((acc, item) => acc + (item.insights?.revenue || 0), 0);

    // Calculate derived metrics safely
    const cpc = safeDivide(spend, clicks);
    const cpm = safeDivide(spend, impressions) * 1000;
    const ctr = safeDivide(clicks, impressions) * 100;
    const cpa = safeDivide(spend, conversions);

    // const roas = safeDivide(revenue, spend);
    const roas = 0;

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
        roas,
    };
}
