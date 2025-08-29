import type { Handler } from "@netlify/functions";

// ID da coleção onde todos os decks dos utilizadores serão guardados.
// Pode alterar isto para qualquer valor, mas mantenha-o em segredo.
const COLLECTION_ID = "kuromi_flashcards_collection_v1";

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { syncId } = event.queryStringParameters;
  const API_KEY = process.env.JSONBIN_API_KEY;
  const decksData = JSON.parse(event.body);

  if (!syncId) {
    return { statusCode: 400, body: "syncId é obrigatório." };
  }
  if (!API_KEY) {
    return { statusCode: 500, body: "Chave de API não configurada." };
  }

  try {
    // Primeiro, tenta obter os metadados do caixote para ver se ele já existe
    const getResponse = await fetch(`https://api.jsonbin.io/v3/b/latest?meta=false&name=${syncId}`, {
      headers: {
        "X-Master-Key": API_KEY,
        "X-Collection-Id": COLLECTION_ID
      },
    });

    const existingBins = await getResponse.json();
    const binExists = existingBins.length > 0;

    let binId;

    if (binExists) {
        // Se o caixote com este nome personalizado já existe, atualiza-o.
        binId = existingBins[0].id;
        await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY,
            },
            body: JSON.stringify(decksData)
        });
    } else {
        // Se não existe, cria um novo caixote com o nome personalizado.
        const createResponse = await fetch('https://api.jsonbin.io/v3/b', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY,
                'X-Bin-Name': syncId, // Usa o ID personalizado como nome do caixote
                'X-Collection-Id': COLLECTION_ID // Guarda-o na nossa coleção
            },
            body: JSON.stringify(decksData)
        });
        const newData = await createResponse.json();
        binId = newData.metadata.id;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ syncId, success: true }),
    };

  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};

export { handler };