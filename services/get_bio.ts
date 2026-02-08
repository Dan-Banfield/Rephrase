const APIFY_TOKEN = process.env.EXPO_PUBLIC_APIFY_API_KEY || "";
const ACTOR_ID = "dSCLg0C3YEZ83HzYX";

export const getBio = async () => {
    try {
        const input = {
            "usernames": ["wormald03"],
            "includeAboutSection": false
        };

        const runUrl = `https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${APIFY_TOKEN}&waitForFinish=120`;
        const runResponse = await fetch(runUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
        });

        if (!runResponse.ok) throw new Error('Actor run failed');

        const runData = await runResponse.json();
        const datasetId = runData.data.defaultDatasetId;

        const datasetUrl = `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`;
        const datasetResponse = await fetch(datasetUrl);
        
        if (!datasetResponse.ok) throw new Error('Dataset fetch failed');

        const items = await datasetResponse.json();
        
        if (items.length > 0 && items[0].biography) {
            return items[0].biography;
        } else {
            console.log("No bio found");
            return ""; 
        }

    } catch (error) {
        console.error('Apify Error:', error);
        return null;
    }
};