import { serve } from "https://deno.land/std@0.177.0/http/mod.ts";
import { serveDir } from "https://deno.land/std@0.177.0/http/file_server.ts";
import { transpile as performTranspilation, type TranspileOptions } from "https://deno.land/x/emit@0.38.2/mod.ts";
import { contentType } from "https://deno.land/std@0.220.1/media_types/mod.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.45/deno-dom-wasm.ts";

const config = JSON.parse(await Deno.readTextFile("./deno.json"));
const transpileOptions: TranspileOptions = {
    compilerOptions: {
        ...(config?.compilerOptions ?? {}),
        inlineSourceMap: true,
        inlineSources: true,
    },
    allowRemote: true,
    importMap: {
        imports: config?.imports ?? {},
    },
};

async function transpile(url: string, source: string): Promise<string> {
    const targetUrl = new URL(`serve:///${url}`);
    const transpilationResult = await performTranspilation(targetUrl, {
        ...transpileOptions,
        load: (specifier) => {
            return Promise.resolve(
                specifier === targetUrl.toString()
                    ? {
                        kind: "module",
                        specifier,
                        content: source,
                    }
                    : {
                        kind: "external",
                        specifier,
                    },
            );
        },
    });

    const result = transpilationResult.get(targetUrl.toString());
    if (!result) {
        throw new Error("Transpilation failed");
    }

    return result;
}

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
        const doc = new DOMParser().parseFromString(await response.text(), "text/html");
        if (!doc) {
            throw new Error("Failed to parse HTML");
        }

        const importMap = doc.createElement("script");
        importMap.textContent = JSON.stringify({
            imports: config?.imports ?? {},
        });
        importMap.setAttribute("type", "importmap");
        doc.head.prepend(importMap);

        const { headers } = response;
        headers.delete("content-length");
        return new Response(doc.documentElement?.outerHTML, {
            status: response.status,
            statusText: response.statusText,
            headers,
        });
    }

    return response;
});
