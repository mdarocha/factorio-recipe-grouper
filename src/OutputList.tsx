import { useContext } from "preact/hooks";
import { Data, type DataType } from "./context/data.tsx";
import { ItemIcon } from "./ItemIcon.tsx";

export function OutputList({ recipes }: { recipes: DataType["recipes"] }) {
    const data = useContext(Data);

    return (
        <ul class="item-list">
            {recipes
                .map((recipe) => ({
                    ...recipe,
                    icon: data.icons.find((icon) => icon.id === recipe.id),
                }))
                .map((recipe) => (
                    <li>
                        {recipe.icon && <ItemIcon icon={recipe.icon} />}
                        <span class="item-label">{recipe.name}</span>
                        <span class="recipe-inputs">
                            {Object.keys(recipe.in)
                                .map((id) => data.icons.find((icon) => icon.id === id))
                                .map((icon, i) => (<>
                                    {i !== 0 && <>+</>}
                                    {!icon && <>No icon</>}
                                    {icon && <ItemIcon icon={icon} />}
                                </>))}
                        </span>
                    </li>
                ))}
        </ul>
    );
}
