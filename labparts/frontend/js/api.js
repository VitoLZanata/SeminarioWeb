// Camada de comunicação com o backend. É o único arquivo que usa fetch.
const BASE_URL =
  window.location.port === "3000"
    ? "/api/componentes"
    : "http://localhost:3000/api/componentes"; // ex.: Live Server do VS Code

async function requisitar(caminho = "", opcoes = {}) {
  let resposta;
  try {
    resposta = await fetch(BASE_URL + caminho, {
      headers: { "Content-Type": "application/json" },
      ...opcoes,
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Ele está rodando?");
  }

  if (resposta.status === 204) return null;

  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(dados.erro || "Erro inesperado.");
  return dados;
}

const api = {
  listar: (busca = "") => requisitar(busca ? `?busca=${encodeURIComponent(busca)}` : ""),
  categorias: () => requisitar("/categorias"),
  criar: (dados) => requisitar("", { method: "POST", body: JSON.stringify(dados) }),
  atualizar: (id, dados) => requisitar(`/${id}`, { method: "PUT", body: JSON.stringify(dados) }),
  excluir: (id) => requisitar(`/${id}`, { method: "DELETE" }),
};
