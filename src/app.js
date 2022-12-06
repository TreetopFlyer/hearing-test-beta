import * as TW from "./twind.js";
import * as UI from "./ui.js";
import * as Store from "./store.js";
import React from "https://esm.sh/preact@10.11.3/compat";
import {html} from "https://esm.sh/htm@3.1.1/preact";

const ShadowDOM = document.querySelector("#app").attachShadow({mode: "open"});
const ShadowDiv = document.createElement("div");
const ShadowCSS = document.createElement("style");
ShadowDOM.append(ShadowCSS);
ShadowDOM.append(ShadowDiv);

TW.Init(ShadowCSS, ShadowDiv);

const Audiogram =()=>
{
    const [State, Dispatch] = Store.Consumer();

    const testL = State.Draw.TestL.Points.map(p=>html`<${UI.Mark} x=${p.X} y=${p.Y} response=${p.Mark.Resp} right=${false}/>`);
    const testR = State.Draw.TestR.Points.map(p=>html`<${UI.Mark} x=${p.X} y=${p.Y} response=${p.Mark.Resp} right=${true} />`);
    const userL = State.Draw.UserL.Points.map(p=>html`<${UI.Mark} x=${p.X} y=${p.Y} response=${p.Mark.Resp} right=${false}/>`);
    const userR = State.Draw.UserR.Points.map(p=>html`<${UI.Mark} x=${p.X} y=${p.Y} response=${p.Mark.Resp} right=${true} />`);

    return html`
    <svg class="absolute top-0 w-full h-full overflow-visible stroke(blue-700 bold draw)">
        ${testL}
        ${testR}
    </svg>`;
};

React.render(html`
    <${Store.Provider}>
        <${UI.Button} icon="+">hey!<//>
        <${UI.Button} light>Left<//>
        <${UI.Button} inactive>Right<//>
        <${UI.Button} disabled>Right<//>
        <${UI.Chart}>
            <${Audiogram}/>
        <//>
    <//>
`, ShadowDiv);