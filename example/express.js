/* eslint-disable no-console */

import * as path from "node:path";
import * as url from "node:url";

import { dirname } from "desm";
import express from "express"; // eslint-disable-line import/no-unresolved
import helmet from "helmet";

import Provider from "../lib/index.js"; // from 'oidc-provider';

import Account from "./support/account.js";
import configuration from "./support/configuration.js";
import routes from "./routes/express.js";
import https from "https";
import fs from "fs";

import bodyParser from "body-parser";
import * as jose from "jose";

const __dirname = dirname(import.meta.url);

const { PORT = 3001, ISSUER = `https://xauth.test:9001` } = process.env;
configuration.findAccount = Account.findAccount;

const app = express();

app.use(bodyParser.json());

const directives = helmet.contentSecurityPolicy.getDefaultDirectives();
delete directives["form-action"];
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives,
    },
  })
);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

let server;
try {
  let adapter;
  if (process.env.MONGODB_URI) {
    ({ default: adapter } = await import("./adapters/mongodb.js"));
    await adapter.connect();
  }

  const prod = process.env.NODE_ENV === "production";

  const provider = new Provider(ISSUER, { adapter, ...configuration });

  if (prod) {
    app.enable("trust proxy");
    provider.proxy = true;

    app.use((req, res, next) => {
      if (req.secure) {
        next();
      } else if (req.method === "GET" || req.method === "HEAD") {
        res.redirect(
          url.format({
            protocol: "https",
            host: req.get("host"),
            pathname: req.originalUrl,
          })
        );
      } else {
        res.status(400).json({
          error: "invalid_request",
          error_description: "do yourself a favor and only use https",
        });
      }
    });
  }

  routes(app, provider);
  app.get("/checkJWT", async (req, res) => {
    console.log({ x: req.body.token });

    try {
      const alg = "RS256";
      const jwk = configuration.jwks.keys[0];
      const publicKey = await jose.importJWK(jwk, alg);
      const jwt = req.body.token;
      const { payload, protectedHeader } = await jose.jwtVerify(jwt, publicKey);

      res.send({
        token: req.body.token,
        payload,
        OK: true,
      });
    } catch (error) {
      res.send({ OK: false });
    }
  });

  app.use(provider.callback());
  server = app.listen(PORT, () => {
    console.log(
      `application is listening on port ${PORT}, check its /.well-known/openid-configuration`
    );
  });
} catch (err) {
  if (server?.listening) server.close();
  console.error(err);
  process.exitCode = 1;
}
