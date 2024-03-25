import { walk } from "https://deno.land/std@0.220.1/fs/mod.ts";
import { transpile, transformHtml } from "./common.ts";

for await(const e of walk('./src')) {
    if (!e.isFile) {
        continue;
    }

    if (e.name.endsWith(".ts") || e.name.endsWith(".tsx")) {
        const source = await Deno.readTextFile(e.path);
        const result = await transpile(e.path, source.replaceAll(/\.tsx?/g, ".js"));
        await Deno.writeTextFile(e.path.replace(/\.tsx?$/, ".js"), result);
    }

    if (e.name.endsWith(".html")) {
        const source = await Deno.readTextFile(e.path);
        const result = transformHtml(source.replaceAll(/\.tsx?/g, ".js"));
        await Deno.writeTextFile(e.path, result);
    }
}
