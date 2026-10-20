// Configuração do Express: middlewares na ordem em que a requisição passa por eles.
const path = require("path");
const express = require("express");
const cors = require("cors");
const componenteRoutes = require("./routes/componenteRoutes");

const app = express();

app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV !== "test") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
    next();
  });
}

app.use("/api/componentes", componenteRoutes);

// O backend também serve o frontend: tudo roda com um comando.
app.use(express.static(path.join(__dirname, "..", "..", "frontend")));

// JSON malformado no corpo da requisição
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ erro: "JSON inválido no corpo da requisição." });
  }
  console.error(err);
  res.status(500).json({ erro: "Erro interno do servidor." });
});

module.exports = app;
