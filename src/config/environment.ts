const DEFAULT_PORT = 3000;

function readPort(): number {
  const port = Number(process.env.PORT ?? DEFAULT_PORT);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("PORT debe ser un entero positivo");
  }

  return port;
}

export const environment = {
  port: readPort(),
};
