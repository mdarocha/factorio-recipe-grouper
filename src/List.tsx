import { useContext } from "preact/hooks";
import { Data } from "./context/data.tsx";
import { ItemIcon } from "./ItemIcon.tsx";

export function List() {
    const data = useContext(Data);

    return <ul>
        {data.recipes
            .filter(recipe => recipe.category !== "technology")
            .map(recipe => ({
                name: recipe.name,
                icon: data.icons.find(icon => icon.id === recipe.id)
            }))
            .map(recipe => <li>
                {recipe.icon && <ItemIcon icon={recipe.icon} />}
                <span>{recipe.name}</span>
            </li>)
        }
    </ul>
}
