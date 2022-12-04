//@ts-check
import React from "https://esm.sh/preact@10.11.3/compat";
import { html } from "https://esm.sh/htm@3.1.1/preact";
import { ColumnMapping } from "./store.js";

/** @typedef {({children}:{children:React.ReactNode})=>JSX.Element} BasicElement */

/** @type {({children, icon, light, disabled, inactive, onClick}:{children:React.ReactNode, icon?:JSX.Element, light:boolean, disabled:boolean, inactive:boolean, onClick:()=>void})=>JSX.Element} */
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
        class="shadow-sss relative flex rounded-lg text(lg white) font-sans group transition-all ${disabled ? "scale-90 bg-gray-400" : "bg-emerald-500"} ${(inactive||disabled) && "cursor-default"}"
    >
        <span class="absolute top-0 left-0 w-full h-full rounded-lg bg-black transition-opacity duration-300 opacity-0 ${(!inactive && !disabled) && "group-hover:opacity-50"}"></span>
        ${ FlashGet > 0 && html`<span key=${FlashGet} class="absolute top-0 left-0 w-full h-full rounded-lg bg-green-400 shadow-glow-green-300 animate-flash"></span>` }
        
        ${ icon && html`<span class="block relative p-2 border-r(1 [#00000066])">
            <span class="absolute top-0 left-0 w-full h-full bg-black rounded(tl-lg bl-lg) opacity-20"></span>
            <span class="relative">${icon}</span>
        </span>` }
        <span class="p-2 relative border-l(1 [#ffffff44])">
            <span class="absolute shadow-glow-yellow-500 top-0 left-1/2 w-6 h-[6px] bg-white rounded-full translate(-x-1/2 -y-1/2) transition-all duration-500 ${light ? "opacity-100" : "opacity-0 scale-y-0"}"></span>
            ${children}
        </span>
    </button>`;
}

/** @type {BasicElement} */
export function Chart({children})
{
    const inset = 20;
    /** @type {Array<JSX.Element>} */
    const rules = [];
    ColumnMapping.forEach(([label, position, normal])=>
    {
        rules.push(html`
        <span class="block absolute top-[-${inset}px] left-[${position*100}%] w-0 h-[calc(100%+${inset*2}px)] border-r(1 slate-400) ${!normal && "border-dashed"}">
            <span class="block absolute top-0 left-0 -translate-x-1/2 -translate-y-full pb-${normal ? 4 : 1}">${label}</span>
        </span>`);
    });

    const dbMin = -10;
    const dbMax = 120;
    for(let db = dbMin; db <= dbMax; db+=10)
    {
        rules.push(html`
        <span class="block absolute  left-[-${inset}px]   top-[${((db-dbMin) / (dbMax-dbMin))*100}%]   h-0 w-[calc(100%+${inset*2}px)] border-b(${db == 0 ? "2 black" : "1 slate-400"})">
            <span class="block absolute top-0 left-0 -translate-x-full -translate-y-1/2 pr-2">${db}</span>
        </span>
        `);
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
    </div>
    `;
}


/** @type {Record<string, BasicElement>} */
const Glyph = {
    Arrow:({children})=> html`
    <line vector-effect="non-scaling-stroke" x1="100%" y1="100%" x2="0%"   y2="0%"  ></line>
    <line vector-effect="non-scaling-stroke" x1="100%" y1="100%" x2="25%"  y2="100%"></line>
    <line vector-effect="non-scaling-stroke" x1="100%" y1="100%" x2="100%" y2="25%" ></line>`,

    //style="transform: translate(50%, 50%) rotate(-15deg) scale(0.5);"
    X: ({children})=> html`
    <line x1="-50%" y1="-50%" x2="50%" y2="50%" ></line>
    <line x1="-50%" y1="50%"  x2="50%" y2="-50%"></line>
    <g class="scale-50 translate(x-1/2 y-1/2) rotate-[-15deg]">${children}</g>`,

    O: ({children})=> html`
    <ellipse rx="50%" ry="50%"></ellipse>
    <g style="transform: translate(-35.35%, 35.35%) rotate(96deg) scale(0.5);">${children}</g>`
};

/** @type {({right, response, x, y}:{right:boolean, response?:boolean, x:string|number, y:string|number})=>JSX.Element} */
export function Mark({right, response, x, y})
{
    return html`
    <svg x=${x} y=${y} width="20" height="20" class="overflow-visible">
        <${ right ? Glyph.O : Glyph.X }>
            ${ !response && html`<${Glyph.Arrow}/>`  }
        <//>
    </svg>
    `;
}