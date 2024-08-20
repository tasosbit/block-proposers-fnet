import { Type } from '@sinclair/typebox';
import { Database } from "duckdb-async";
import { getAllProposerCounts, getAllProposerCountsAfter, getProposerBlocksAfter, getMaxRound, countRecords, } from './db.js';
import Fastify, { FastifyPluginAsync, FastifyRequest } from 'fastify'

export async function start(dbClient: Database) {
  const server = Fastify({
    ajv: {
      customOptions: {
        removeAdditional: "all",
        coerceTypes: true,
        useDefaults: true,
      }
    },
    logger: {
      level: process.env.LOG_LEVEL,
    },
  });

  const routes: FastifyPluginAsync = async (server) => {
    server.get('/v0/status', {
      schema: {
        response: {
          200: Type.Object({
            ok: Type.Literal(1),
            maxRound: Type.Number(),
            records: Type.Number(),
          }),
        },
      },
    }, async function () {
      const maxRound = await getMaxRound(dbClient);
      const records = await countRecords(dbClient);
      console.log({records, maxRound});
      return { ok: 1, maxRound, records };
    });

    const minRoundQueryString = Type.Object({ minRound: Type.Optional(Type.Number()) });

    server.get('/v0/proposers', {
      schema: {
        querystring: minRoundQueryString,
        response: {
          200: Type.Array(Type.Object({
            proposer: Type.String(),
            blocks: Type.Number()
          })),
        },
      },
    }, async function (request: any) {
      const minRound = request.query.minRound;
      const proposers = minRound ? (await getAllProposerCountsAfter(dbClient, minRound))
        : (await getAllProposerCounts(dbClient));
      return proposers;
    });
  };

  await server.register(routes);

  await server.ready();

  const port = 8118;
  const host = '0.0.0.0';
  await server.listen({ host, port });
  
  console.log("Server listening on", port);
}
