import React from "react";
import { html } from "htm";
import * as Store from "./store.js";
import * as Tone from "./tone.js";

/** @typedef {({children}:{children?:preact.ComponentChildren})=>preact.VNode} BasicElement */

/** @type {({children, icon, light, disabled, inactive, onClick}:{children:preact.VNode, icon?:preact.VNode, light:boolean, disabled:boolean, inactive:boolean, onClick:()=>void})=>preact.VNode} */
export function Button({children, icon, light, disabled, inactive, onClick})
{
    const [FlashGet, FlashSet] = React.useState(0);
    const handleClick =()=>
    {
        if(inactive||disabled){ return; }
        FlashSet(FlashGet+1);
        onClick();
    };

    return html`
    <button
        onClick=${handleClick}
        class="shadow-sss relative flex items-stretch rounded-lg text(lg white) font-sans group transition-all ${disabled ? "scale-90 bg-gray-400" : "bg-emerald-500"} ${(inactive||disabled) && "cursor-default"}"
    >
        <span class="absolute top-0 left-0 w-full h-full rounded-lg bg-black transition-opacity duration-300 opacity-0 ${(!inactive && !disabled) && "group-hover:opacity-50"}"></span>
        ${ FlashGet > 0 && html`<span key=${FlashGet} class="absolute top-0 left-0 w-full h-full rounded-lg bg-green-400 shadow-glow-green-300 animate-flash"></span>` }
        
        ${ icon && html`<span class="flex items-center block relative px-2 border-r(1 [#00000066])">
            <span class="absolute top-0 left-0 w-full h-full bg-black rounded(tl-lg bl-lg) opacity-20"></span>
            <span class="relative">${icon}</span>
        </span>` }
        <span class="flex items-center p-2 relative border-l(1 [#ffffff44])">
            <span class="absolute shadow-glow-yellow-500 top-0 left-1/2 w-6 h-[6px] bg-white rounded-full translate(-x-1/2 -y-1/2) transition-all duration-500 ${light ? "opacity-100" : "opacity-0 scale-y-0"}"></span>
            ${children}
        </span>
    </button>`;
}

/** @type {BasicElement} */
export const Select =()=>
{
    const [State, Dispatch] = Store.Consumer();
    /** @type {(e:Event)=>void} */
    const handleChange =(e)=> Dispatch({Name:"Test", Data:parseInt(/** @type {HTMLSelectElement}*/(e.target).value)});

    return html`
    <div class="font-sans">
        <label for="#test-select" class="inline-block">Select Test:</label>
        <select id="test-select" class="px-2 py-2 rounded border(1 slate-200) inline-block" value=${State.TestIndex} onChange=${handleChange}>
            ${State.Test.map((t, i)=>html`<option value=${i}>${t.Name}</option>`)}
        </select>
    </div>`;
}

/** @type {BasicElement} */
export const Grade =()=>
{
    const [State] = Store.Consumer();
    const grade = Store.Grade(State.Live.Test);
    return html`<div class="font-sans">
        <div>Complete: ${grade.Done} of ${grade.Total}</div>
        <div>Accuracy: ${grade.Score}%</div>
        <div class="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div class=${`h-full w-[${grade.Done/grade.Total*100}%] bg-emerald-500 shadow-sss`}></div>
        </div>
    </div>`
};

/** @type {BasicElement} */
export const Controls =()=>
{
    const [State, Dispatch] = Store.Consumer();

    const [pulsedGet, pulsedSet] = React.useState(true);
    const [playGet, playSet] = React.useState(0);
    React.useEffect(()=>
    {
        /** @type {number|undefined} */
        let timer;
        if(playGet == 1)
        {
            const volNorm = (State.Stim.Value-State.Stim.Min)/(State.Stim.Max-State.Stim.Min);
            Tone.Play(!pulsedGet, State.Chan.Value, Store.ColumnMapping[State.Freq.Value][0], (volNorm*0.8) + 0.1);

            if(State.Live.Freq)
            {
                const testMark = State.Live.Freq[/** @type {"TestL"|"TestR"}*/(`Test${State.Chan.Value ? "R":"L"}`)];
                const handler = testMark.Stim <= State.Stim.Value ? ()=>{playSet(2)} : ()=>{playSet(0)}
                timer = setTimeout(handler, 500 + Math.random()*1000);
            }
        }
        return () => clearTimeout(timer);
        
    }, [playGet]);

    return html`
    <${Grade}/>
    <div class="flex">
        <div>Channel</div>
        <div>${State.Chan.Value}</div>
        <${Button} light=${State.Chan.Value == 0} inactive=${State.Chan.Value == 0} onClick=${()=>Dispatch({Name:"Chan", Data:-1})}>Left<//>
        <${Button} light=${State.Chan.Value == 1} inactive=${State.Chan.Value == 1} onClick=${()=>Dispatch({Name:"Chan", Data:1})}>Right<//>
    </div>
    <div class="flex">
        <div>Frequency</div>
        <div>${Store.ColumnMapping[State.Freq.Value][0]}</div>
        <${Button} disabled=${State.Freq.Value == State.Freq.Min} onClick=${()=>Dispatch({Name:"Freq", Data:-1})}>-<//>
        <${Button} disabled=${State.Freq.Value == State.Freq.Max} onClick=${()=>Dispatch({Name:"Freq", Data:1})}>+<//>
    </div>
    <div class="flex">
        <div>Stimulus</div>
        <div>${State.Stim.Value}</div>
        <${Button} disabled=${State.Stim.Value == State.Stim.Min} onClick=${()=>Dispatch({Name:"Stim", Data:-1})}>-<//>
        <${Button} disabled=${State.Stim.Value == State.Stim.Max} onClick=${()=>Dispatch({Name:"Stim", Data:1})}>+<//>
    </div>
    <div class="flex">
        <div>Tone</div>
        <${Button} onClick=${()=>{pulsedSet(true)}} light=${pulsedGet} inactive${pulsedGet}>Pulsed<//>
        <${Button} onClick=${()=>{pulsedSet(false)}} light=${!pulsedGet} inactive${!pulsedGet}>Continuous<//>
    </div>
    <div class="flex">
        <div>Present</div>
        <svg width="60" height="60" viewBox="0 0 79 79" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle fill="url(#metal)" cx="39" cy="40" r="35"></circle>
            <circle fill="url(#metal)" cx="39.5" cy="39.5" r="29.5" transform="rotate(180 39.5 39.5)"></circle>
            <circle fill="url(#metal)" cx="39" cy="40" r="27"></circle>
            <circle fill="url(#backwall)" cx="39" cy="40" r="25"></circle>
            <ellipse fill="url(#clearcoat)" cx="39" cy="33" rx="20" ry="16"></ellipse>
            ${playGet == 2 && html`<circle fill="url(#light)" cx="39.5" cy="39.5" r="36" class="animate-pulse"></circle>`}
            <defs>
                <linearGradient id="metal" x1="39.5" y1="1" x2="39.5" y2="78" gradientUnits="userSpaceOnUse">
                    <stop offset="0.0" stop-color="#C4C4C4" stop-opacity="1.0"></stop>
                    <stop offset="1.0" stop-color="#F2F2F2" stop-opacity="1.0"></stop>
                </linearGradient>
                <radialGradient id="backwall" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(39 56) rotate(-90) scale(45.5 74.4907)">
                    <stop offset="0.0" stop-color="#AAAAAA" stop-opacity="1.0"></stop>
                    <stop offset="1.0" stop-color="#333333" stop-opacity="1.0"></stop>
                </radialGradient>
                <radialGradient id="clearcoat" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(39 38.5) rotate(90) scale(50.5 71.9394)">
                    <stop offset="0.0" stop-color="#ffffff" stop-opacity="0.0"></stop>
                    <stop offset="0.7" stop-color="#ffffff" stop-opacity="1.0"></stop>
                </radialGradient>
                <radialGradient id="light" cx="0" cy="0" r="1.0" gradientUnits="userSpaceOnUse" gradientTransform="translate(39.5 39.5) rotate(90) scale(39.5)">
                    <stop offset="0.2" stop-color="#ffffff" stop-opacity="1.0"></stop>
                    <stop offset="0.5" stop-color="#ff8800" stop-opacity="1.6"></stop>
                    <stop offset="0.9" stop-color="#ffffff" stop-opacity="0.0"></stop>
                </radialGradient>
            </defs>
        </svg>
        <${Button} onClick=${()=>playSet(1)} disabled=${playGet==1} icon=${html`<svg class="w-3 h-3"><polygon points="0,0 10,5 0,10" fill="#ffffff" stroke="none"></polygon></svg>`}>Play<//>
    </div>
    <div class="flex">
        <div>Mark</div>
        <${Button} onClick=${()=>Dispatch({Name:"Mark", Data:true })} icon=${html`<${Mark} right=${State.Chan.Value} response=${true}  x="0" y="0" classes="stroke(white 2 draw) w-2 h-2 translate-x-1/2 translate-y-1/2"/>`}>Response<//>
        <${Button} onClick=${()=>Dispatch({Name:"Mark", Data:false})} icon=${html`<${Mark} right=${State.Chan.Value} response=${false} x="0" y="0" classes="stroke(white 2 draw) w-2 h-2 translate-x-1/2 translate-y-1/2"/>`}>No Response<//>
        <${Button}
        icon=${html`<svg x="0" y="0" class="translate-x-1/2 translate-y-1/2 stroke-draw h-2 overflow-visible stroke-white w-2 stroke-2">
            <ellipse vector-effect="non-scaling-stroke" rx="70%" ry="70%"></ellipse>
            <line    vector-effect="non-scaling-stroke" x1="-50%" y1="-50%" x2="50%" y2="50%"></line>
        </svg>`}
        onClick=${()=>Dispatch({Name:"Mark", Data:null })}
        disabled=${State.Live.Mark == undefined}>Clear<//>
    </div>
    `;
};

/** @type {BasicElement} */
export const Audiogram =()=>
{
    const [State] = Store.Consumer();

    const testMarksL = State.Draw.TestL.Points.map(p=>html`<${Mark} x=${p.X} y=${p.Y} response=${p.Mark?.Resp} right=${false}/>`);
    const userMarksL = State.Draw.UserL.Points.map(p=>html`<${Mark} x=${p.X} y=${p.Y} response=${p.Mark?.Resp} right=${false} classes=${State.Live.Mark == p.Mark ? "stroke-bold":""}/>`);
    const testMarksR = State.Draw.TestR.Points.map(p=>html`<${Mark} x=${p.X} y=${p.Y} response=${p.Mark?.Resp} right=${true} />`);
    const userMarksR = State.Draw.UserR.Points.map(p=>html`<${Mark} x=${p.X} y=${p.Y} response=${p.Mark?.Resp} right=${true} classes=${State.Live.Mark == p.Mark ? "stroke-bold":""}/>`);

    const testLinesL = State.Draw.TestL.Paths.map( p=>html`<line class="opacity-60" x1=${p.Head.X} y1=${p.Head.Y} x2=${p.Tail.X} y2=${p.Tail.Y} />`);
    const userLinesL = State.Draw.UserL.Paths.map( p=>html`<line class="opacity-60" x1=${p.Head.X} y1=${p.Head.Y} x2=${p.Tail.X} y2=${p.Tail.Y} />`);
    const testLinesR = State.Draw.TestR.Paths.map( p=>html`<line class="opacity-60" x1=${p.Head.X} y1=${p.Head.Y} x2=${p.Tail.X} y2=${p.Tail.Y} />`);
    const userLinesR = State.Draw.UserR.Paths.map( p=>html`<line class="opacity-60" x1=${p.Head.X} y1=${p.Head.Y} x2=${p.Tail.X} y2=${p.Tail.Y} />`);

    return html`
    <svg class="absolute top-0 w-full h-full overflow-visible stroke(blue-700 bold draw) opacity-50">${testMarksL}${testLinesL}</svg>
    <svg class="absolute top-0 w-full h-full overflow-visible stroke(red-700 bold draw)  opacity-50">${testMarksR}${testLinesR}</svg>
    <svg class="absolute top-0 w-full h-full overflow-visible stroke(blue-700 2 draw)">${userMarksL}${userLinesL}</svg>
    <svg class="absolute top-0 w-full h-full overflow-visible stroke(red-700 2 draw)">${userMarksR}${userLinesR}</svg>
    <svg class="absolute top-0 w-1 h-1 overflow-visible transition-all duration-500" style=${{top:State.Draw.Cross?.Y, left:State.Draw.Cross?.X}}>
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

/** @type {BasicElement} */
export function Chart({children})
{
    const [State] = Store.Consumer();
    const inset = 20;
    /** @type {Array<preact.VNode>} */
    const rules = [];
    Store.ColumnMapping.forEach(([label, position, normal])=>
    {
        rules.push(html`
        <span class="block absolute top-[-${inset}px] left-[${position*100}%] w-0 h-[calc(100%+${inset*2}px)] border-r(1 slate-400) ${!normal && "border-dashed"}">
            <span class="block absolute top-0 left-0 -translate-x-1/2 -translate-y-full pb-${normal ? 4 : 1}">${label}</span>
        </span>`
        );
    });

    for(let db = State.Stim.Min; db <= State.Stim.Max; db+=10)
    {
        rules.push(html`
        <span class="block absolute  left-[-${inset}px]   top-[${((db-State.Stim.Min) / (State.Stim.Max-State.Stim.Min))*100}%]   h-0 w-[calc(100%+${inset*2}px)] border-b(${db == 0 ? "2 black" : "1 slate-400"})">
            <span class="block absolute top-0 left-0 -translate-x-full -translate-y-1/2 pr-2">${db}</span>
        </span>`
        );
    }
    return html`
    <div class="relative w-full h-[600px] font(sans medium) text(xs)">
        <div class="absolute right-0 bottom-0 w-[calc(100%-100px)] h-[calc(100%-100px)] border(1 slate-300)">
            <span class="block        absolute top-[-65px] left-0  w-full      text(sm center)     font-black">Frequency in Hz</span>
            <span class="inline-block absolute top-[50%]   left-[-65px] ">
                <span class="inline-block -rotate-90 origin-top -translate-x-1/2 text(sm center) font-black">
                    Hearing Level (dbHL)
                </span>
            </span>
            <div class=${`relative top-[${inset}px] left-[${inset}px] w-[calc(100%-${inset*2}px)] h-[calc(100%-${inset*2}px)]`}>
                <span class="block absolute top-0 left-[-${inset}px] w-[calc(100%+${inset*2}px)] h-[27%] bg-black opacity-10"></span>
                ${ rules }
                <div class="absolute top-0 left-0 w-full h-full">
                    ${ children }
                </div>
            </div>
        </div>
    </div>`;
}

/** @type {Record<string, BasicElement>} */
const Glyph = {
    Arrow:()=> html`
    <line vector-effect="non-scaling-stroke" x1="100%" y1="100%" x2="0%"   y2="0%"  ></line>
    <line vector-effect="non-scaling-stroke" x1="100%" y1="100%" x2="25%"  y2="100%"></line>
    <line vector-effect="non-scaling-stroke" x1="100%" y1="100%" x2="100%" y2="25%" ></line>`,

    X: ({children})=> html`
    <line x1="-50%" y1="-50%" x2="50%" y2="50%" ></line>
    <line x1="-50%" y1="50%"  x2="50%" y2="-50%"></line>
    <g class="scale-50 translate(x-1/2 y-1/2) rotate-[-15deg]">${children}</g>`,

    O: ({children})=> html`
    <ellipse vector-effect="non-scaling-stroke" rx="60%" ry="60%"></ellipse>
    <g style="transform: translate(-40%, 40%) rotate(96deg) scale(0.5);">${children}</g>`
};

/** @type {({right, response, x, y, classes}:{right:boolean, response?:boolean, x:number|string, y:number|string, classes:string})=>preact.VNode} */
export const Mark =({right, response, x, y, classes})=>
{
    return html`
    <svg x=${x} y=${y} width="20" height="20" class=${`overflow-visible ${classes}`}>
        <${ right ? Glyph.O : Glyph.X }>
            ${ !response && html`<${Glyph.Arrow}/>` }
        <//>
    </svg>`;
};