import { serve } from "https://deno.land/std@0.177.0/http/mod.ts";
import { serveDir } from "https://deno.land/std@0.177.0/http/file_server.ts";
import { contentType } from "https://deno.land/std@0.220.1/media_types/mod.ts";
import { transpile, transformHtml } from "./common.ts";

serve(async (request) => {
    const response = await serveDir(request, {
        fsRoot: "./src",
    });

    if (response.status !== 200) {
        return response;
    }

    // if requesting a .ts or .tsx file, transpile it to js
    if (request.url.endsWith(".ts") || request.url.endsWith(".tsx")) {
        const result = await transpile(request.url, await response.text());

        const { headers } = response;
        headers.set("content-type", contentType(".js"));
        headers.delete("content-length");
        return new Response(result, {
            status: response.status,
            statusText: response.statusText,
            headers,
        });
    }

    // if request a html file, inject an import map into it
    if (request.url.endsWith(".html")) {
        const { headers } = response;
        headers.delete("content-length");
        return new Response(transformHtml(await response.text()), {
            status: response.status,
            statusText: response.statusText,
            headers,
        });
    }

    return response;
});
