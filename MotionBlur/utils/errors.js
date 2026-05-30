'use strict';

/**
 * AppError — operational errors with HTTP status and user-friendly message.
 * Use this for expected failures (bad input, auth, not found).
 * Programming errors (bugs) should be uncaught — they'll hit the global handler.
 */
class AppError extends Error {
  constructor(internalMsg, statusCode, userMessage, context = {}) {
    super(internalMsg);
    this.name        = 'AppError';
    this.statusCode  = statusCode;
    this.userMessage = userMessage;
    this.context     = context;
    this.isOperational = true;
    if (Error.captureStackTrace) Error.captureStackTrace(this, AppError);
  }
}

// ── Factory helpers ───────────────────────────────────────
const badRequest = (msg, ctx) => new AppError(msg, 400, 'Nevažeći zahtjev. Provjerite unesene podatke.',     ctx);
const forbidden  = (msg, ctx) => new AppError(msg, 403, 'Pristup odbijen.',                                  ctx);
const notFound   = (msg, ctx) => new AppError(msg, 404, 'Stranica ili resurs nije pronađen.',                ctx);
const tooMany    = (msg, ctx) => new AppError(msg, 429, 'Previše pokušaja. Pokušajte ponovo za nekoliko minuta.', ctx);
const server     = (msg, ctx) => new AppError(msg, 500, 'Interna greška servera. Pokušajte ponovo.',         ctx);

module.exports = { AppError, badRequest, forbidden, notFound, tooMany, server };
