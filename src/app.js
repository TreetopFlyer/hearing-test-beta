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
    const initialized = Reducer(Initial, {Name:"Test", Data:0})
    const reducer = React.useReducer(Reducer, initialized);
    return html`<${StoreContext.Provider} value=${reducer}>${props.children}<//>`;
}
/** @typedef {[state:Store.State, dispatch:(inAction:Store.Action)=>void]} Binding */
/** @type {()=>Binding} */
const StoreConsumer =()=> React.useContext(StoreContext);

const Audiogram =()=>
{
    const [State, Dispatch] = StoreConsumer();

    const testL = State.Draw.TestL.Points.map(p=>html`<${UI.Mark} x=${p.X} y=${p.Y} response=${p.Mark.Resp} right=${false}/>`);
    const testR = State.Draw.TestR.Points.map(p=>html`<${UI.Mark} x=${p.X} y=${p.Y} response=${p.Mark.Resp} right=${true} />`);
    const userL = State.Draw.UserL.Points.map(p=>html`<${UI.Mark} x=${p.X} y=${p.Y} response=${p.Mark.Resp} right=${false}/>`);
    const userR = State.Draw.UserR.Points.map(p=>html`<${UI.Mark} x=${p.X} y=${p.Y} response=${p.Mark.Resp} right=${true} />`);

    return html`
    <svg class="absolute top-0 w-full h-full overflow-visible stroke(blue-700 bold draw)">
        ${testL}
        ${testR}
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
        <${UI.Chart}>
            <${Audiogram}/>
        <//>
    <//>
`, ShadowDiv);