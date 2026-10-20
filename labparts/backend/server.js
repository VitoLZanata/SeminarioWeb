// Ponto de entrada: só inicia o servidor. Rotas e regras ficam em src/.
const app = require("./src/app");

const PORTA = process.env.PORT || 3000;

app.listen(PORTA, () => {
  console.log(`LabParts rodando em http://localhost:${PORTA}`);
});
