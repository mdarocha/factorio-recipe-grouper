import { createContext, type ComponentChildren } from "preact";
import { useState, useEffect } from "preact/hooks";

export interface DataType {
    version: { base: string };
    recipes: {
        id: string;
        name: string;
        category: string;
        row: number;
        time: number;
        producers: string[];
        in: Record<string, number>;
        out: Record<string, number>;
    }[];
    items: {
        id: string;
        name: string;
        category: string;
        stack: number;
        row: number;
    }[];
    categories: {
        id: string;
        name: string;
    }[];
    icons: {
        id: string;
        position: string;
        color: string;
    }[];
}

export const Data = createContext<DataType>('data');

export function DataProvider({ children }: { children: ComponentChildren }) {
    const [data, setData] = useState(null);
    useEffect(async () => {
        const result = await fetch("https://factoriolab.github.io/data/1.1/data.json");
        setData(await result.json());
    }, []);

    return <Data.Provider value={data}>
        {data && children}
        {!data && <span>Loading...</span>}
    </Data.Provider>;
}
