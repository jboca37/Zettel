import { serve } from "https://deno.land/std@0.212.0/http/server.ts";

// Function for adding two numbers
export function add(a: number, b: number): number {
  return a + b;
}

// Start a web server for Tauri to detect
const PORT = 1420;

serve((_req) => {
  return new Response(`Zettel App Running! Add(2,3) = ${add(2, 3)}`, {
    headers: { "Content-Type": "text/plain" },
  });
}, { port: PORT });

console.log(`🚀 Server running at http://localhost:${PORT}`);

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  console.log("Add 2 + 3 =", add(2, 3));
}

