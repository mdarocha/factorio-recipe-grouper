import { useContext, useState } from "preact/hooks";
import { Data, type DataType } from "./context/data.tsx";
import { ItemIcon } from "./ItemIcon.tsx";
import { OutputList } from "./OutputList.tsx";
import { calculate } from "./lib/calculate.ts";

function SelectorPopover({ onClick }: { onClick: (item: DataType["items"][0]) => void }) {
    const data = useContext(Data);

    return (
        <div id="input-selector-popover" popover="auto" style={{ "max-height": "500px" }}>
            <ul class="item-grid">
                {data.items
                    .filter(item => item.category !== "technology")
                    .map((item) => ({
                        ...item,
                        icon: data.icons.find((icon) => icon.id === item.id),
                    }))
                    .filter(item => item.icon)
                    .map((item) => (
                        <li class="item-selectable item-hover-label" aria-label={item.name} onClick={() => { onClick(item); }}>
                            <ItemIcon icon={item.icon} />
                            <span class="item-label">{item.name}</span>
                        </li>
                    ))}
            </ul>
        </div>
    );
}

function SelectedList({ list, onRemove }: { list: DataType["items"], onRemove: (item: DataType["items"][0]) => void }) {
    const data = useContext(Data);

    return (
        <ul class="item-list">
            {list
                .map((item) => ({
                    ...item,
                    icon: data.icons.find((icon) => icon.id === item.id),
                }))
                .map((item) => (
                <li key={item.id}>
                    {item.icon && <ItemIcon icon={item.icon} />}
                    <span class="item-label" style={{ width: "25ch" }}>{item.name}</span>
                    <button aria-label="Remove item" onClick={() => { onRemove(item); }}>X</button>
                </li>))}
        </ul>
    )
}

export function InputSelector() {
    const data = useContext(Data);
    const [items, setItems] = useState<DataType["items"]>([]);

    return (
        <>
            <h5>Select inputs</h5>
            <button popovertarget="input-selector-popover">+ Add</button>
            <SelectorPopover onClick={(item) => {
                console.log(item);
                if (items.find(i => i.id === item.id)) {
                    return;
                }

                setItems(items => [...items, item]);
            }}/>
            <SelectedList list={items} onRemove={(item) => {
                setItems(items => items.filter(i => i.id !== item.id));
            }} />
            <hr />
            {items.length === 0 && <i>Select inputs to see recipes</i>}
            {items.length > 0 && <OutputList recipes={calculate(items, data.recipes)} />}
        </>
    );
}
