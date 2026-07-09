import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Le repo parent contient un autre lockfile : on fixe la racine ici.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
