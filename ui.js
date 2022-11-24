//@ts-check
import React from "https://esm.sh/preact@10.11.3/compat";
import {html} from "https://esm.sh/htm@3.1.1/preact";

export default {
    Button({label, icon, light, disabled})
    {
        return html`<button class="flex bg-red-500 text-white rounded">
            ${ icon && html`<span class="p-2">${icon}</span>` }
            <span class="p-2 relative">
                <span class="absolute top-0 left-1/2 w-14 h-4 bg-red-500 translate(-x-1/2 -y-1/2) rounded-full border(4 white solid)"></span>
                ${label}
            </span>
        </button>`;
    },
    Chart()
    {
        return html`
        <div class="relative w-full h-[600px]">
            <div class="absolute right-0 bottom-0 w-[calc(100%-100px)] h-[calc(100%-100px)]"></div>
        </div>
        `;
    }
}