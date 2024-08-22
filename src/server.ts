import { Type } from '@sinclair/typebox';
import { Database } from "duckdb-async";
import { getAllProposerCounts, getProposerBlocks, getMaxRound, countRecords, } from './db.js';
import Fastify, { FastifyPluginAsync, FastifyRequest } from 'fastify'
import { parseEnvInt } from './utils.js';
import cors from '@fastify/cors';

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

  server.register(cors, {
    origin: '*',
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

    const roundQueryString = Type.Object({
      minRound: Type.Optional(Type.Number()),
      maxRound: Type.Optional(Type.Number()),
    });

    server.get('/v0/proposers', {
      schema: {
        querystring: roundQueryString,
        response: {
          200: Type.Array(Type.Object({
            proposer: Type.String(),
            blocks: Type.Number(),
            payouts: Type.Number(),
          })),
        },
      },
    }, async function (request: any) {
      const minRound = request.query.minRound ?? 0;
      const maxRound = request.query.maxRound ?? Infinity;
      const proposers = await getAllProposerCounts(dbClient, minRound, maxRound);
      return proposers;
    });

    server.get('/v0/proposer/:addr', {
      schema: {
        params: Type.Object({ addr: Type.String({ minLength: 58, maxLength: 58 }) }),
        querystring: roundQueryString,
        response: {
          200: Type.Array(Type.Object({
            rnd: Type.Number(),
            pp: Type.Optional(Type.Number()),
          })),
        },
      },
    }, async function (request: any) {
      const addr = request.params.addr;
      const minRound = request.query.minRound ?? 0;
      const maxRound = request.query.maxRound ?? Infinity;
      const blocks = await getProposerBlocks(dbClient, addr, minRound, maxRound);
      return blocks;
    });
  }; 

  await server.register(routes);

  await server.ready();

  const port = parseEnvInt("PORT", 8118);
  const host = '::';
  await server.listen({ host, port });
  
  console.log("Server listening on", port);
}
