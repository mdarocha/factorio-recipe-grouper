import { render } from "preact";
import { DataProvider } from "./context/data.tsx";
import { List } from "./List.tsx";

function App() {
    return (
        <main>
            <h1>Factorio Recipe Grouper</h1>
            <DataProvider>
                <List />
            </DataProvider>
        </main>
    );
}

render(<App />, document.body);
