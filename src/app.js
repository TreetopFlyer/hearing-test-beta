import * as TW from "./twind.js";
import * as UI from "./ui.js";
import { Reducer, Initial } from "./store.js";
import React from "https://esm.sh/preact@10.11.3/compat";
import {html} from "https://esm.sh/htm@3.1.1/preact";

/** @type {preact.Context<Binding>} */
const StoreContext = React.createContext([Initial, (_a)=>{}]);


/** @type {(props:{children:preact.ComponentChildren})=>preact.VNode} */
const StoreProvider =(props)=>
{
    const reducer = React.useReducer(Reducer, Initial);
    return html`<${StoreContext.Provider} value=${reducer}>${props.children}<//>`;
}

/** @typedef {[state:Store.State, dispatch:(inAction:Store.Action)=>void]} Binding */
/** @type {()=>Binding} */
const StoreConsumer =()=> React.useContext(StoreContext);

const Deep =()=>
{
    const [State, Dispatch] = StoreConsumer();
    return html`
    <${UI.Button} onClick=${()=>Dispatch({Name:"Stim", Data:1})} disabled=${State.Stim.Value == State.Stim.Max}>
        ${State.Stim.Value}
    <//>`;
}

const Audiogram =()=>
{
    const [State, Dispatch] = StoreConsumer();
    return html`
    <svg class="absolute top-0 w-full h-full overflow-visible stroke(blue-700 bold draw)">
        ${State.Draw}
        <${UI.Mark} right=${false} x=${"10%"} y="20%" response=${true} />
        <${UI.Mark} right=${false}/>
        <line x1=${"10%"} y1=${"10%"} x2=${"50%"} y2=${"50%"} class="stroke-2 opacity-60" />
    </svg>
    `;
}

const ShadowDOM = document.querySelector("#app").attachShadow({mode: "open"});
const ShadowDiv = document.createElement("div");
const ShadowCSS = document.createElement("style");
ShadowDOM.append(ShadowCSS);
ShadowDOM.append(ShadowDiv);

TW.Init(ShadowCSS, ShadowDiv);

React.render(html`
    <${StoreProvider}>
        <${UI.Button} icon="+">hey!<//>
        <${UI.Button} light>Left<//>
        <${UI.Button} inactive>Right<//>
        <${UI.Button} disabled>Right<//>
        <${Deep}/>
        <${UI.Chart}>
            <svg class="absolute top-0 w-full h-full overflow-visible stroke(blue-700 bold draw)">
                <${UI.Mark} right=${true}  x=${"20%"} y="20%" />
                <${UI.Mark} right=${false} x=${"10%"} y="20%" response=${true} />
                <${UI.Mark} right=${false}/>
                <line x1=${"10%"} y1=${"10%"} x2=${"50%"} y2=${"50%"} class="stroke-2 opacity-60" />
            </svg>
        <//>
    <//>
`, ShadowDiv);