// Controller: decide o status HTTP e o formato da resposta. Não escreve SQL.
const Componente = require("../models/componenteModel");

function lerId(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ erro: "ID inválido." });
    return null;
  }
  return id;
}

exports.listar = (req, res) => {
  const busca = typeof req.query.busca === "string" ? req.query.busca : "";
  res.status(200).json(Componente.listar(busca));
};

exports.categorias = (req, res) => {
  res.status(200).json(Componente.CATEGORIAS);
};

exports.buscarPorId = (req, res) => {
  const id = lerId(req, res);
  if (id === null) return;
  const item = Componente.buscarPorId(id);
  if (!item) return res.status(404).json({ erro: "Componente não encontrado." });
  res.status(200).json(item);
};

exports.criar = (req, res) => {
  const erros = Componente.validar(req.body);
  if (erros.length) return res.status(400).json({ erro: erros.join(" ") });
  res.status(201).json(Componente.criar(req.body));
};

exports.atualizar = (req, res) => {
  const id = lerId(req, res);
  if (id === null) return;
  const erros = Componente.validar(req.body);
  if (erros.length) return res.status(400).json({ erro: erros.join(" ") });
  const item = Componente.atualizar(id, req.body);
  if (!item) return res.status(404).json({ erro: "Componente não encontrado." });
  res.status(200).json(item);
};

exports.excluir = (req, res) => {
  const id = lerId(req, res);
  if (id === null) return;
  if (!Componente.excluir(id)) {
    return res.status(404).json({ erro: "Componente não encontrado." });
  }
  res.status(204).send();
};
