import type { Handler } from "@netlify/functions";

const COLLECTION_ID = "kuromi_flashcards_collection_v1";

const handler: Handler = async (event) => {
  const { syncId } = event.queryStringParameters;
  const API_KEY = process.env.JSONBIN_API_KEY;

  if (!syncId) {
    return { statusCode: 400, body: "syncId é obrigatório." };
  }
  if (!API_KEY) {
    return { statusCode: 500, body: "Chave de API não configurada." };
  }

  try {
    // Procura pelo caixote com o nome correspondente ao syncId dentro da nossa coleção
    const response = await fetch(`https://api.jsonbin.io/v3/b/latest?meta=false&name=${syncId}`, {
      headers: { 
        "X-Master-Key": API_KEY,
        "X-Collection-Id": COLLECTION_ID
      },
    });

    if (!response.ok) {
        throw new Error(`Falha ao buscar dados: ${response.statusText}`);
    }

    const bins = await response.json();

    if (bins.length === 0) {
        return { statusCode: 404, body: JSON.stringify({ message: "Nenhum deck encontrado com este ID." }) };
    }

    // Se encontrou, devolve o conteúdo do primeiro caixote correspondente
    const deckData = bins[0];
    return {
      statusCode: 200,
      body: JSON.stringify(deckData),
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};

export { handler };