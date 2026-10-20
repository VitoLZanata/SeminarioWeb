// Testes da API com o test runner nativo do Node (npm test).
process.env.NODE_ENV = "test";
process.env.DB_FILE = ":memory:";

const test = require("node:test");
const assert = require("node:assert");
const app = require("./src/app");

let servidor, base;
test.before(() => new Promise((ok) => {
  servidor = app.listen(0, () => { base = `http://localhost:${servidor.address().port}/api/componentes`; ok(); });
}));
test.after(() => servidor.close());

const json = (m, corpo) => ({ method: m, headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });
const valido = { nome: "LED vermelho 5 mm", categoria: "Passivo", descricao: "", localizacao: "Caixa C2", quantidade: 50 };

test("CRUD completo", async () => {
  let r = await fetch(base, json("POST", valido));
  assert.strictEqual(r.status, 201);
  const criado = await r.json();

  r = await fetch(`${base}/${criado.id}`);
  assert.strictEqual(r.status, 200);

  r = await fetch(`${base}/${criado.id}`, json("PUT", { ...valido, quantidade: 40 }));
  assert.strictEqual((await r.json()).quantidade, 40);

  r = await fetch(`${base}?busca=led`);
  assert.strictEqual((await r.json()).length, 1);

  r = await fetch(`${base}/${criado.id}`, { method: "DELETE" });
  assert.strictEqual(r.status, 204);
  r = await fetch(`${base}/${criado.id}`);
  assert.strictEqual(r.status, 404);
});

test("validação e ID inválido", async () => {
  let r = await fetch(base, json("POST", { ...valido, quantidade: -1 }));
  assert.strictEqual(r.status, 400);
  r = await fetch(base, json("POST", { ...valido, nome: "A" }));
  assert.strictEqual(r.status, 400);
  r = await fetch(`${base}/abc`);
  assert.strictEqual(r.status, 400);
});
