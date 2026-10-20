// Rotas: ligam método + caminho à função do controller.
const express = require("express");
const controller = require("../controllers/componenteController");

const router = express.Router();

router.get("/categorias", controller.categorias); // antes de "/:id" para não ser confundida com um ID
router.get("/", controller.listar);
router.get("/:id", controller.buscarPorId);
router.post("/", controller.criar);
router.put("/:id", controller.atualizar);
router.delete("/:id", controller.excluir);

module.exports = router;
