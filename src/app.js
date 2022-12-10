import React from "react";
import {html} from "htm";
import * as TW from "./twind.js";
import * as UI from "./ui.js";
import * as Store from "./store.js";

// @ts-ignore: 
const ShadowDOM = document.querySelector("#app").attachShadow({mode: "open"});
const ShadowDiv = document.createElement("div");
const ShadowCSS = document.createElement("style");
ShadowDOM.append(ShadowCSS);
ShadowDOM.append(ShadowDiv);

TW.Init(ShadowCSS, ShadowDiv);

const Controls =()=>
{
    const [State, Dispatch] = Store.Consumer();

    return html`
    <div class="flex">
        <div>Channel</div>
        <div>${State.Chan.Value}</div>
        <${UI.Button} light=${State.Chan.Value == 0} inactive=${State.Chan.Value == 0} onClick=${()=>Dispatch({Name:"Chan", Data:-1})}>Left<//>
        <${UI.Button} light=${State.Chan.Value == 1} inactive=${State.Chan.Value == 1} onClick=${()=>Dispatch({Name:"Chan", Data:1})}>Right<//>
    </div>
    <div class="flex">
        <div>Frequency</div>
        <div>${Store.ColumnMapping[State.Freq.Value][0]}</div>
        <${UI.Button} disabled=${State.Freq.Value == State.Freq.Min} onClick=${()=>Dispatch({Name:"Freq", Data:-1})}>-<//>
        <${UI.Button} disabled=${State.Freq.Value == State.Freq.Max} onClick=${()=>Dispatch({Name:"Freq", Data:1})}>+<//>
    </div>
    <div class="flex">
        <div>Stimulus</div>
        <div>${State.Stim.Value}</div>
        <${UI.Button} disabled=${State.Stim.Value == State.Stim.Min} onClick=${()=>Dispatch({Name:"Stim", Data:-1})}>-<//>
        <${UI.Button} disabled=${State.Stim.Value == State.Stim.Max} onClick=${()=>Dispatch({Name:"Stim", Data:1})}>+<//>
    </div>
    <div class="flex">
        <div>Mark</div>
        <${UI.Button} onClick=${()=>Dispatch({Name:"Mark", Data:true })}>Response<//>
        <${UI.Button} onClick=${()=>Dispatch({Name:"Mark", Data:false})}>No Response<//>
        <${UI.Button} onClick=${()=>Dispatch({Name:"Mark", Data:null })} disabled=${State.Live.Mark == undefined}>Clear<//>
    </div>
    `;
};

const Audiogram =()=>
{
    const [State] = Store.Consumer();

    const testMarksL = State.Draw.TestL.Points.map(p=>html`<${UI.Mark} x=${p.X} y=${p.Y} response=${p.Mark?.Resp} right=${false}/>`);
    const userMarksL = State.Draw.UserL.Points.map(p=>html`<${UI.Mark} x=${p.X} y=${p.Y} response=${p.Mark?.Resp} right=${false} classes=${State.Live.Mark == p.Mark ? "stroke-bold":""}/>`);
    const testMarksR = State.Draw.TestR.Points.map(p=>html`<${UI.Mark} x=${p.X} y=${p.Y} response=${p.Mark?.Resp} right=${true} />`);
    const userMarksR = State.Draw.UserR.Points.map(p=>html`<${UI.Mark} x=${p.X} y=${p.Y} response=${p.Mark?.Resp} right=${true} classes=${State.Live.Mark == p.Mark ? "stroke-bold":""}/>`);

    const testLinesL = State.Draw.TestL.Paths.map( p=>html`<line class="opacity-60" x1=${p.Head.X} y1=${p.Head.Y} x2=${p.Tail.X} y2=${p.Tail.Y} />`);
    const userLinesL = State.Draw.UserL.Paths.map( p=>html`<line class="opacity-60" x1=${p.Head.X} y1=${p.Head.Y} x2=${p.Tail.X} y2=${p.Tail.Y} />`);
    const testLinesR = State.Draw.TestR.Paths.map( p=>html`<line class="opacity-60" x1=${p.Head.X} y1=${p.Head.Y} x2=${p.Tail.X} y2=${p.Tail.Y} />`);
    const userLinesR = State.Draw.UserR.Paths.map( p=>html`<line class="opacity-60" x1=${p.Head.X} y1=${p.Head.Y} x2=${p.Tail.X} y2=${p.Tail.Y} />`);

    return html`
    <svg class="absolute top-0 w-full h-full overflow-visible stroke(blue-700 bold draw) opacity-50">${testMarksL}${testLinesL}</svg>
    <svg class="absolute top-0 w-full h-full overflow-visible stroke(red-700 bold draw)  opacity-50">${testMarksR}${testLinesR}</svg>
    <svg class="absolute top-0 w-full h-full overflow-visible stroke(blue-700 2 draw)">${userMarksL}${userLinesL}</svg>
    <svg class="absolute top-0 w-full h-full overflow-visible stroke(red-700 2 draw)">${userMarksR}${userLinesR}</svg>
    <svg class="absolute top-0 w-full h-full overflow-visible transition-all duration-500" style=${{top:State.Draw.Cross?.Y, left:State.Draw.Cross?.X}}>
        <ellipse cx="0" cy="0" rx="8" ry="30" fill="url(#glow)"></ellipse>
        <ellipse cx="0" cy="0" rx="30" ry="8" fill="url(#glow)"></ellipse>
        <defs>
            <radialGradient id="glow">
                <stop stop-color=${State.Chan.Value ? "red" : "blue"} stop-opacity="0.6" offset="0.0"></stop>
                <stop stop-color=${State.Chan.Value ? "red" : "blue"} stop-opacity="0.3" offset="0.2"></stop>
                <stop stop-color=${State.Chan.Value ? "red" : "blue"} stop-opacity="0.0" offset="1.0"></stop>
            </radialGradient>
        </defs>
    </svg>
    `;
};

React.render(html`
    <${Store.Provider}>
        <${Controls}/>
        <${UI.Chart}>
            <${Audiogram}/>
        <//>
    <//>
`, ShadowDiv);