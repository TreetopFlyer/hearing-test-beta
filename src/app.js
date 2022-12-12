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

        <div class="grid grid-cols-[300px_auto] items-center">
            <div class="col-start-1 p-10">
                <img src="./logo.png"/>
            </div>
            <div class="flex justify-center">
                <${UI.Select}/>
            </div>
            <div class="col-start-1">
                <${UI.Controls}/>
            </div>
            <div class="">
                <${UI.Chart}>
                    <${UI.Audiogram}/>
                <//>
            </div>
        </div>

    <//>
`, ShadowDiv);