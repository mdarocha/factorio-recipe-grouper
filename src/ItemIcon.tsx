import { type DataType } from "./context/data.tsx";

export function ItemIcon({ icon }: { icon: DataType["icons"][0] }) {
    return <div class="item-icon" style={{ "--icon-position": icon.position }}></div>;
}
