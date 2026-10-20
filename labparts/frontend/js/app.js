// Manipulação do DOM e eventos. Não conhece a URL da API.
const LIMITE_BAIXO = 3;

const el = {
  form: document.getElementById("form"),
  id: document.getElementById("id"),
  nome: document.getElementById("nome"),
  categoria: document.getElementById("categoria"),
  localizacao: document.getElementById("localizacao"),
  quantidade: document.getElementById("quantidade"),
  descricao: document.getElementById("descricao"),
  salvar: document.getElementById("btn-salvar"),
  cancelar: document.getElementById("btn-cancelar"),
  tituloForm: document.getElementById("titulo-form"),
  painelForm: document.getElementById("titulo-form").closest(".painel"),
  tabela: document.getElementById("tabela"),
  vazio: document.getElementById("vazio"),
  busca: document.getElementById("busca"),
  mensagem: document.getElementById("mensagem"),
};

let componentes = [];
let temporizador;

function mostrarMensagem(texto, tipo = "sucesso") {
  el.mensagem.textContent = texto;
  el.mensagem.className = `mensagem ${tipo}`;
  clearTimeout(temporizador);
  temporizador = setTimeout(() => {
    el.mensagem.textContent = "";
    el.mensagem.className = "mensagem";
  }, 5000);
}

function situacao(qtd) {
  if (qtd === 0) return ["Sem estoque", "zerado"];
  if (qtd <= LIMITE_BAIXO) return ["Estoque baixo", "baixo"];
  return ["Em estoque", "ok"];
}

function criarCelula(texto, classe) {
  const td = document.createElement("td");
  td.textContent = texto;
  if (classe) td.className = classe;
  return td;
}

function criarBotao(texto, classe, rotuloCompleto, aoClicar) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = texto;
  b.className = classe;
  b.setAttribute("aria-label", rotuloCompleto);
  b.addEventListener("click", aoClicar);
  return b;
}

function desenharTabela() {
  el.tabela.replaceChildren();
  el.vazio.hidden = componentes.length > 0;

  for (const c of componentes) {
    const tr = document.createElement("tr");

    const tdNome = document.createElement("td");
    tdNome.className = "nome";
    const forte = document.createElement("strong");
    forte.textContent = c.nome;
    tdNome.append(forte);
    if (c.descricao) {
      const pequeno = document.createElement("small");
      pequeno.textContent = c.descricao;
      tdNome.append(pequeno);
    }

    const [rotulo, classe] = situacao(c.quantidade);
    const tdSit = document.createElement("td");
    const selo = document.createElement("span");
    selo.className = `situacao ${classe}`;
    selo.textContent = rotulo;
    tdSit.append(selo);

    const tdAcoes = document.createElement("td");
    tdAcoes.className = "botoes";
    tdAcoes.append(
      criarBotao("Editar", "secundario", `Editar ${c.nome}`, () => iniciarEdicao(c)),
      criarBotao("Excluir", "perigo", `Excluir ${c.nome}`, () => excluir(c))
    );

    tr.append(tdNome, criarCelula(c.categoria), criarCelula(c.localizacao || "—"),
      criarCelula(c.quantidade, "num"), tdSit, tdAcoes);
    el.tabela.append(tr);
  }
}

async function carregar() {
  try {
    componentes = await api.listar(el.busca.value.trim());
    desenharTabela();
  } catch (e) {
    mostrarMensagem(e.message, "erro");
  }
}

function limparFormulario() {
  el.form.reset();
  el.id.value = "";
  el.quantidade.value = 0;
  el.tituloForm.textContent = "Cadastrar componente";
  el.salvar.textContent = "Cadastrar componente";
  el.cancelar.hidden = true;
  el.painelForm.classList.remove("editando");
}

function iniciarEdicao(c) {
  el.id.value = c.id;
  el.nome.value = c.nome;
  el.categoria.value = c.categoria;
  el.localizacao.value = c.localizacao;
  el.quantidade.value = c.quantidade;
  el.descricao.value = c.descricao;
  el.tituloForm.textContent = `Editar ${c.nome}`;
  el.salvar.textContent = "Salvar alterações";
  el.cancelar.hidden = false;
  el.painelForm.classList.add("editando");
  el.nome.focus();
}

async function excluir(c) {
  if (!confirm(`Excluir "${c.nome}"? Essa ação não pode ser desfeita.`)) return;
  try {
    await api.excluir(c.id);
    if (el.id.value === String(c.id)) limparFormulario();
    mostrarMensagem("Componente excluído.");
    carregar();
  } catch (e) {
    mostrarMensagem(e.message, "erro");
  }
}

el.form.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const dados = {
    nome: el.nome.value,
    categoria: el.categoria.value,
    localizacao: el.localizacao.value,
    quantidade: Number(el.quantidade.value),
    descricao: el.descricao.value,
  };
  const editando = el.id.value !== "";
  try {
    if (editando) await api.atualizar(el.id.value, dados);
    else await api.criar(dados);
    mostrarMensagem(editando ? "Alterações salvas." : "Componente cadastrado.");
    limparFormulario();
    carregar();
  } catch (e) {
    mostrarMensagem(e.message, "erro");
  }
});

el.cancelar.addEventListener("click", limparFormulario);

let esperaBusca;
el.busca.addEventListener("input", () => {
  clearTimeout(esperaBusca);
  esperaBusca = setTimeout(carregar, 250);
});

async function iniciar() {
  try {
    const categorias = await api.categorias();
    for (const nome of categorias) el.categoria.add(new Option(nome, nome));
  } catch (e) {
    mostrarMensagem(e.message, "erro");
  }
  carregar();
}

iniciar();
