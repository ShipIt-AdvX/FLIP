import fastify from "../packages/backend/src/core.js";

export default async function handler(req, res) {
    await fastify.ready();

    fastify.server.emit("request", req, res);
}