import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { parse } from "yaml";

// Contrato OpenAPI en la raíz del repo (el Dockerfile lo copia junto a dist/)
export const OPENAPI_PATH = resolve(process.cwd(), "openapi.yaml")

const document = parse(readFileSync(OPENAPI_PATH, "utf8"))

export const rDocs = Router()

rDocs.get("/openapi.json", (req, res) => {
    res.json(document)
})
rDocs.use("/", swaggerUi.serve, swaggerUi.setup(document))
