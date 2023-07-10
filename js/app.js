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

React.render(html`
    <${Store.Provider}>
    <div class="max-w-[1270px] mx-auto font-sans text-[16px] text-black">

        <${UI.Header}/>

        <div class="flex flex-col items-start lg:flex-row mt-4 mb-24">
            <${UI.Controls}/>
            <${UI.Chart}>
                <${UI.Audiogram}/>
                <div class="absolute left-0 w-full top-full md:(w-[300px] left-auto top-auto -right-[10px] -bottom-[10px])">
                    <${UI.Display}/>
                </div>
            <//>

        </div>

    </div>
    <//>
`, ShadowDiv);