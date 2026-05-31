/**
 * @module app/api/openapi/route
 * @description Route publique exposant la spécification OpenAPI de l'API Next.js,
 * consommée par Swagger UI sur /api-docs.
 */

import { NextResponse } from "next/server";
import { openApiSpec } from "@/lib/openapi";

/**
 * Route GET /api/openapi — retourne le document OpenAPI complet.
 * @returns {NextResponse} Réponse JSON contenant la spécification OpenAPI.
 */
export function GET() {
  return NextResponse.json(openApiSpec);
}
