// Model: regras da entidade Componente e consultas SQL. Não conhece HTTP.
const db = require("../config/database");

const CATEGORIAS = [
  "Microcontrolador",
  "Sensor",
  "Passivo",
  "Atuador",
  "Comunicação",
  "Alimentação",
  "Outro",
];

const Componente = {
  CATEGORIAS,

  // Retorna a lista de mensagens de erro (vazia se estiver tudo certo).
  validar(dados) {
    const erros = [];
    const nome = typeof dados.nome === "string" ? dados.nome.trim() : "";
    const descricao = dados.descricao ?? "";
    const localizacao = dados.localizacao ?? "";

    if (nome.length < 2 || nome.length > 100) {
      erros.push("O nome é obrigatório e deve ter de 2 a 100 caracteres.");
    }
    if (!CATEGORIAS.includes(dados.categoria)) {
      erros.push(`A categoria deve ser uma destas: ${CATEGORIAS.join(", ")}.`);
    }
    if (typeof descricao !== "string" || descricao.length > 500) {
      erros.push("A descrição deve ter no máximo 500 caracteres.");
    }
    if (typeof localizacao !== "string" || localizacao.length > 60) {
      erros.push("A localização deve ter no máximo 60 caracteres.");
    }
    if (!Number.isInteger(dados.quantidade) || dados.quantidade < 0) {
      erros.push("A quantidade deve ser um número inteiro maior ou igual a zero.");
    }
    return erros;
  },

  listar(busca = "") {
    const termo = `%${busca.trim()}%`;
    return db
      .prepare(
        `SELECT * FROM componentes
         WHERE nome LIKE ? OR categoria LIKE ? OR localizacao LIKE ?
         ORDER BY nome COLLATE NOCASE`
      )
      .all(termo, termo, termo);
  },

  buscarPorId(id) {
    return db.prepare("SELECT * FROM componentes WHERE id = ?").get(id);
  },

  criar({ nome, categoria, descricao = "", localizacao = "", quantidade }) {
    const info = db
      .prepare(
        "INSERT INTO componentes (nome, categoria, descricao, localizacao, quantidade) VALUES (?, ?, ?, ?, ?)"
      )
      .run(nome.trim(), categoria, descricao.trim(), localizacao.trim(), quantidade);
    return this.buscarPorId(info.lastInsertRowid);
  },

  atualizar(id, { nome, categoria, descricao = "", localizacao = "", quantidade }) {
    const info = db
      .prepare(
        `UPDATE componentes
         SET nome = ?, categoria = ?, descricao = ?, localizacao = ?, quantidade = ?
         WHERE id = ?`
      )
      .run(nome.trim(), categoria, descricao.trim(), localizacao.trim(), quantidade, id);
    return info.changes === 0 ? null : this.buscarPorId(id);
  },

  excluir(id) {
    return db.prepare("DELETE FROM componentes WHERE id = ?").run(id).changes > 0;
  },
};

module.exports = Componente;
