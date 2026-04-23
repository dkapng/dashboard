
const token = process.env.NOTION_TOKEN;
const dbs = {
    'AGENDA': '2eea9587-ac4b-4e3f-ab9b-a9f24beac713',
    'LINHA_EDITORIAL': '1eaee169-2383-41ee-b0d9-d554505bddc5',
    'ENTREGAS': 'e8901e47-1364-4fba-af1d-c92e8d4f5f39',
    'DATAS_SAZONAIS': '2139ccb8-dc28-45e4-92cb-94b5ed9dae47'
};

async function discover() {
    for (const [name, id] of Object.entries(dbs)) {
        console.log(`\n--- ${name} (${id}) ---`);
        try {
            const response = await fetch(`https://api.notion.com/v1/databases/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Notion-Version': '2022-06-28'
                }
            });
            const data = await response.json();
            if (data.properties) {
                console.log('Properties found:');
                for (const propName in data.properties) {
                    console.log(` - ${propName} (${data.properties[propName].type})`);
                }
            } else {
                console.log('Error:', data.message || 'Unknown error');
            }
        } catch (err) {
            console.error('Fetch error:', err.message);
        }
    }
}

discover();
