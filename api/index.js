import fastify from "../packages/backend/src/core";

export default async function handler(req, res) {
    await fastify.ready();

    fastify.server.emit("request", req, res);
}