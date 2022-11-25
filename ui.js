//@ts-check
import React from "https://esm.sh/preact@10.11.3/compat";
/// <reference types="https://esm.sh/v99/htm@3.1.1/preact/index.d.ts"/>
import {html} from "https://esm.sh/htm@3.1.1/preact";

export default {
    Button({children, icon, light, disabled})
    {
        return html`
        <button class="flex bg-red-500 text-white rounded">
            ${ icon && html`<span class="p-2">${icon}</span>` }
            <span class="p-2 relative">
                <span class="absolute top-0 left-1/2 w-14 h-4 bg-red-500 translate(-x-1/2 -y-1/2) rounded-full border(4 white solid)"></span>
                ${children}
            </span>
        </button>`;
    },

    /** @type {({children}:{inset:number, children:React.ReactNode})=>JSX.Element} */
    Chart({children})
    {
        const inset = 20
        const size = 1/6;
        /** @type {Record<string, [position:number, normal:boolean]>} */
        const mappingX = {
             "125": [size*0.0, true ],
             "250": [size*1.0, true ],
             "500": [size*2.0, true ],
            "1000": [size*3.0, true ],
            "2000": [size*4.0, true ],
            "3000": [size*4.5, false],
            "4000": [size*5.0, true ],
            "6000": [size*5.5, false],
            "8000": [size*6.0, true ],
        };
        const rulesX = Object.entries(mappingX).map(([label, [position, normal]])=>
        {
            return html`
            <span class="block absolute top-[-${inset}px] left-[${position*100}%] w-0 h-[calc(100%+${inset*2}px)] border-r(1 slate-400) ${!normal && "border-dashed"}">
                <span class="block absolute top-0 left-0 -translate-x-1/2 -translate-y-full pb-${normal ? 4 : 1}">${label}</span>
            </span>`;
        });
        const rulesY = [];
        const rulesYMin = -10;
        const rulesYMax = 120;
        for(let db = rulesYMin; db <= rulesYMax; db+=10)
        {
            const percent = ((db-rulesYMin) / (rulesYMax-rulesYMin))*100;
            rulesY.push(html`
            <span class="block absolute  left-[-${inset}px]   top-[${percent}%]   h-0 w-[calc(100%+${inset*2}px)] border-b(${db == 0 ? "2 black" : "1 slate-400"})">
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
                    ${ rulesX }
                    ${ rulesY }
                    ${ children }
                </div>
            </div>
        </div>
        `;
    }
}