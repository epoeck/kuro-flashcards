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

    // Se não houver um syncId, é a primeira vez que guardamos. Criamos um novo registo.
    if (!currentSyncId) {
        const createResponse = await fetch('https://api.jsonbin.io/v3/b', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY,
                'X-Bin-Name': `Kuromi-Decks-${Date.now()}`
            },
            body: JSON.stringify(decksData)
        });
        if (!createResponse.ok) throw new Error("Falha ao criar novo registo na nuvem.");
        const newData = await createResponse.json();
        currentSyncId = newData.metadata.id; // O novo ID é o ID do caixote gerado pelo JSONBin
    } else {
    // Se já existe um syncId, apenas o atualizamos.
        const updateResponse = await fetch(`https://api.jsonbin.io/v3/b/${currentSyncId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY,
            },
            body: JSON.stringify(decksData)
        });
        if (!updateResponse.ok) throw new Error("Falha ao atualizar o registo na nuvem.");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ syncId: currentSyncId, success: true }),
    };

  } catch (error) {
    console.error("Erro em save-decks:", error);
    return { statusCode: 500, body: error.toString() };
  }
};

export { handler };