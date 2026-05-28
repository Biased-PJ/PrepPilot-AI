import { createRequestHandler } from "@tanstack/react-start/server";
import manifest from "./dist/server/manifest.json";

export default createRequestHandler({
  manifest,
});
