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
    const [State] = Store.Consumer();

    /** @type {(inAmount:number)=>string} */ const Perc =(inAmount)=> (inAmount*100)+"%";

    const testMarksL = State.Draw.TestL.Points.map(p=>html`<${UI.Mark} x=${Perc(p.X)} y=${Perc(p.Y)} response=${p.Mark.Resp} right=${false}/>`);
    const testMarksR = State.Draw.TestR.Points.map(p=>html`<${UI.Mark} x=${Perc(p.X)} y=${Perc(p.Y)} response=${p.Mark.Resp} right=${true} />`);
    const testLinesL = State.Draw.TestL.Paths.map( p=>html`<line class="opacity-60" x1=${Perc(p.Head.X)} y1=${Perc(p.Head.Y)} x2=${Perc(p.Tail.X)} y2=${Perc(p.Tail.Y)} />`);
    const testLinesR = State.Draw.TestR.Paths.map( p=>html`<line class="opacity-60" x1=${Perc(p.Head.X)} y1=${Perc(p.Head.Y)} x2=${Perc(p.Tail.X)} y2=${Perc(p.Tail.Y)} />`);

    const userMarksL = State.Draw.UserL.Points.map(p=>html`<${UI.Mark} x=${Perc(p.X)} y=${Perc(p.Y)} response=${p.Mark.Resp} right=${false}/>`);
    const userMarksR = State.Draw.UserR.Points.map(p=>html`<${UI.Mark} x=${Perc(p.X)} y=${Perc(p.Y)} response=${p.Mark.Resp} right=${true} />`);
    const userLinesL = State.Draw.UserL.Paths.map( p=>html`<line class="opacity-60" x1=${Perc(p.Head.X)} y1=${Perc(p.Head.Y)} x2=${Perc(p.Tail.X)} y2=${Perc(p.Tail.Y)} />`);
    const userLinesR = State.Draw.UserR.Paths.map( p=>html`<line class="opacity-60" x1=${Perc(p.Head.X)} y1=${Perc(p.Head.Y)} x2=${Perc(p.Tail.X)} y2=${Perc(p.Tail.Y)} />`);

    return html`
    <svg class="absolute top-0 w-full h-full overflow-visible stroke(blue-700 bold draw) opacity-50">${testMarksL}${testLinesL}</svg>
    <svg class="absolute top-0 w-full h-full overflow-visible stroke(red-700 bold draw)  opacity-50">${testMarksR}${testLinesR}</svg>
    <svg class="absolute top-0 w-full h-full overflow-visible stroke(blue-700 2 draw)">${userMarksL}${userLinesL}</svg>
    <svg class="absolute top-0 w-full h-full overflow-visible stroke(red-700 2 draw)">${userMarksR}${userLinesR}</svg>`;
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