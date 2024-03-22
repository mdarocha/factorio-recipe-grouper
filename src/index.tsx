import { render } from "preact";
import { DataProvider } from "./context/data.tsx";
import { InputSelector } from "./InputSelector.tsx";

function App() {
    return (
        <main>
            <h1>Factorio Recipe Grouper</h1>
            <p>
                This tool allows you to group recipes by their inputs.
                It's useful for organizing your factory production sites or city blocks.
            </p>
            <DataProvider>
                <InputSelector />
            </DataProvider>
        </main>
    );
}

render(<App />, document.body);
