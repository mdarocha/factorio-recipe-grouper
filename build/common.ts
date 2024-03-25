import { transpile as performTranspilation, type TranspileOptions } from "https://deno.land/x/emit@0.38.2/mod.ts";
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

export async function transpile(url: string, source: string): Promise<string> {
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

export function transformHtml(html: string): string {
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (!doc) {
        throw new Error("Failed to parse HTML");
    }

    const importMap = doc.createElement("script");
    importMap.textContent = JSON.stringify({
        imports: config?.imports ?? {},
    });
    importMap.setAttribute("type", "importmap");
    doc.head.prepend(importMap);

    return doc.documentElement?.outerHTML ?? "";
}
