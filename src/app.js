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
        <${UI.Select}/>

        <div class="flex">
            <${UI.Controls}/>
            <div class="flex-1">
                <${UI.Chart}>
                    <${UI.Audiogram}/>
                <//>
            </div>
        </div>
        
    <//>
`, ShadowDiv);