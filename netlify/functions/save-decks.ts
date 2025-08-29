import type { Handler } from "@netlify/functions";

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { syncId } = event.queryStringParameters;
  const API_KEY = process.env.JSONBIN_API_KEY;
  const decksData = JSON.parse(event.body);

  if (!API_KEY) {
    return { statusCode: 500, body: "Chave de API não configurada" };
  }

  try {
    let currentSyncId = syncId;
    let isNewBin = !currentSyncId;

    // Se é um novo conjunto de decks, cria um novo "bin" no JSONBin
    if (isNewBin) {
        const createResponse = await fetch('https://api.jsonbin.io/v3/b', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY,
                'X-Bin-Name': `Kuromi-Decks-${Date.now()}`
            },
            body: JSON.stringify(decksData)
        });
        const newData = await createResponse.json();
        currentSyncId = newData.metadata.id;
    } else {
    // Se já existe, apenas atualiza
        await fetch(`https://api.jsonbin.io/v3/b/${currentSyncId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY,
            },
            body: JSON.stringify(decksData)
        });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ syncId: currentSyncId, success: true }),
    };

  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};

export { handler };