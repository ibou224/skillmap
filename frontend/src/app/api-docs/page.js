"use client";

/**
 * @module app/api-docs/page
 * @description Page de documentation interactive de l'API (Swagger UI) alimentée
 * par la spécification OpenAPI servie sur /api/openapi.
 */

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

/**
 * Page Swagger UI affichant la documentation OpenAPI de l'API.
 * @returns {JSX.Element} Le composant Swagger UI.
 */
export default function ApiDocsPage() {
  return <SwaggerUI url="/api/openapi" />;
}
