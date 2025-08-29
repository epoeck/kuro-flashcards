import type { Handler } from "@netlify/functions";

const handler: Handler = async (event) => {
  const { syncId } = event.queryStringParameters;
  const API_KEY = process.env.JSONBIN_API_KEY;

  if (!syncId) {
    return { statusCode: 400, body: "syncId é obrigatório" };
  }
  if (!API_KEY) {
    return { statusCode: 500, body: "Chave de API não configurada" };
  }

  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${syncId}/latest`, {
      headers: { "X-Master-Key": API_KEY },
    });

    if (!response.ok) {
        if (response.status === 404) {
             return { statusCode: 404, body: JSON.stringify({ message: "Nenhum deck encontrado com este ID." }) };
        }
        throw new Error(`Falha ao buscar dados: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data.record),
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};

export { handler };