import { auth } from "~/lib/auth";
import type { Route } from "./+types/api.auth.$";

// Universal auth handler for all HTTP methods
async function handleAuth(request: Request) {
  console.log("[API Auth] Request:", request.method, request.url);
  try {
    const response = await auth.handler(request);
    console.log("[API Auth] Response:", response.status);

    // Ensure CORS headers are set
    const headers = new Headers(response.headers);
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    console.error("[API Auth] Error:", error);
    throw error;
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  return handleAuth(request);
}

export async function action({ request }: Route.ActionArgs) {
  return handleAuth(request);
}
