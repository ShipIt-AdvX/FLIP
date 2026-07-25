import fastify from "./core.js";

fastify.listen({ port: 5738, host: "0.0.0.0" }, (e, a) => {
    if (e) {
        fastify.log.error(`failed to start: ${e}`);
    }
    fastify.log.info(`server listening on ${a}`);
});