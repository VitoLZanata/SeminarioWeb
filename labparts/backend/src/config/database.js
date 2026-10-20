// Conexão com o SQLite e criação da tabela. Para trocar de banco, mude só este arquivo e o model.
const path = require("path");
const Database = require("better-sqlite3");

const caminho = process.env.DB_FILE || path.join(__dirname, "..", "..", "database.sqlite");
const db = new Database(caminho);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS componentes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nome        TEXT    NOT NULL,
    categoria   TEXT    NOT NULL,
    descricao   TEXT    NOT NULL DEFAULT '',
    localizacao TEXT    NOT NULL DEFAULT '',
    quantidade  INTEGER NOT NULL DEFAULT 0 CHECK (quantidade >= 0),
    criado_em   TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`);

// Dados de exemplo apenas na primeira execução, para a tabela não começar vazia.
const total = db.prepare("SELECT COUNT(*) AS n FROM componentes").get().n;
if (total === 0 && process.env.NODE_ENV !== "test") {
  const inserir = db.prepare(
    "INSERT INTO componentes (nome, categoria, descricao, localizacao, quantidade) VALUES (?, ?, ?, ?, ?)"
  );
  [
    ["ESP32-S3 DevKitC", "Microcontrolador", "Módulo com Wi-Fi e Bluetooth LE", "Gaveta A1", 6],
    ["BMP280", "Sensor", "Pressão e temperatura, interface I2C", "Gaveta B2", 12],
    ["MPU6050", "Sensor", "Acelerômetro e giroscópio de 6 eixos", "Gaveta B2", 3],
    ["Resistor 330 Ω", "Passivo", "1/4 W, 5%", "Caixa C1", 200],
    ["Módulo LoRa SX1278", "Comunicação", "433 MHz, SPI", "Gaveta D3", 2],
  ].forEach((linha) => inserir.run(...linha));
}

module.exports = db;
