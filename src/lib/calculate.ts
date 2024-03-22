import { type DataType } from "../context/data.tsx";

export function calculate(inputs: DataType["items"], recipes: DataType["recipes"]): DataType["recipes"] {
    return recipes.filter(recipe => {
        return false;
    });
}
