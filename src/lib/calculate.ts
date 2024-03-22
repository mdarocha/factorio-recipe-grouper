import { type DataType } from "../context/data.tsx";

// these recursive recipes break the logic
const bannedRecipes = [
    "coal-liquefaction",
    "coal-liquefaction-steam-500",
    "kovarex-enrichment-process"
];

function requirementsMatchInputs(requirements: string[], inputs: DataType["items"]): boolean {
    return requirements.every(requirement =>
        inputs.some(input => input.id === requirement)
    );
}

function searchRequirements(requirement: string, inputs: DataType["items"], recipes: DataType["recipes"], log = false): string[] {
    if (requirementsMatchInputs([requirement], inputs)) {
        return [requirement];
    }

    const creationRecipes = (req) => recipes
        .filter(recipe => !bannedRecipes.includes(recipe.id))
        .filter(recipe => {
            const outputs = Object.keys(recipe.out);
            return outputs.some(output => output === req);
        })
        .map(recipe => ({
            ...recipe,
            in: Object.keys(recipe.in).length === 0 ? { "NOT_FOUND": 0 } : recipe.in
        }));

    const result = creationRecipes(requirement).map(recipe => {
        const recipeInputs = Object.keys(recipe.in);

        if (log) {
            console.log (requirement, recipe);
        }

        let matchedInputs = recipeInputs.filter(id => requirementsMatchInputs([id], inputs));
        let unmatchedInputs = recipeInputs.filter(id => !requirementsMatchInputs([id], inputs));
        while (unmatchedInputs.length > 0 && !unmatchedInputs.includes("NOT_FOUND")) {
            const newRecipes = unmatchedInputs
                .map(id => creationRecipes(id)?.[0] ?? []) // TODO check all recipes
                .flat();
            if (log) {
                console.log("matchedInputs", matchedInputs);
                console.log("unmatchedInputs", unmatchedInputs);
                console.log("newRecipes", newRecipes);
                console.log("---");
            }


            if (newRecipes.length === 0) {
                unmatchedInputs = ["NOT_FOUND"];
                break;
            }

            const newInputs = newRecipes.map(recipe => Object.keys(recipe.in)).flat();
            matchedInputs = [...matchedInputs, ...newInputs.filter(id => requirementsMatchInputs([id], inputs))];
            unmatchedInputs = newInputs.filter(id => !requirementsMatchInputs([id], inputs));
        }

        if (log) {
            console.log("final result", unmatchedInputs);
        }
        return unmatchedInputs.length > 0 ? ["NOT_FOUND"] : matchedInputs;
    });

    const finalResult = result.find(r => r.length > 0) ?? ["NOT_FOUND"];
    if (log) {
        console.log("result", result);
        console.log("finalResult", finalResult);
    }
    return finalResult;
}

export function calculate(inputs: DataType["items"], recipes: DataType["recipes"]): { matched: DataType["recipes"], unmatched: DataType["recipes"], intermediates: DataType["items"] } {
    const predicate = recipe => {
        const requirements = Object.keys(recipe.in)
            .map(requirement => searchRequirements(requirement, inputs, recipes))
            .flat();
        return requirements.length > 0 && requirementsMatchInputs(requirements, inputs)
    };

    const result = recipes.map(recipe => ({
        ...recipe,
        matches: predicate(recipe)
    }));

    return {
        matched: result.filter(recipe => recipe.matches),
        unmatched: result.filter(recipe => !recipe.matches),
        intermediates: result
            .filter(recipe => recipe.matches)
            .map(recipe => Object.keys(recipe.in))
            .flat()
            .filter(id => !requirementsMatchInputs([id], inputs))
            .reduce((acc, cur) => ({
                ...acc, [cur]: acc[cur] ? acc[cur] + 1 : 1
            }), {})
    };
}
