import React from "react";
import {html} from "htm";
import * as TW from "./twind.js";
import * as UI from "./ui.js";
import * as Store from "./store.js";

/** @typedef {import("https://esm.sh/v135/@twind/core@1.0.1/core.js").TwindUserConfig} TwindUserConfig */

/** @typedef {{selector?:string, logo?:string, twind?:(conf:TwindUserConfig)=>TwindUserConfig}} AppSettings*/

/** @type {(settings:AppSettings)=>Promise<void>} */
export default async function(settings)
{

    // @ts-ignore: 
    const ShadowDOM = document.querySelector(settings?.selector || "#app").attachShadow({mode: "open"});
    const ShadowDiv = document.createElement("div");
    const ShadowCSS = document.createElement("style");
    ShadowDOM.append(ShadowCSS);
    ShadowDOM.append(ShadowDiv);

    await TW.Init(ShadowCSS, ShadowDiv, settings?.twind);

    const logo = await import.meta.resolve(settings?.logo||"logo")

    React.render(html`
        <${Store.Provider}>
        <div class="max-w-[1270px] mx-auto font-sans text-[16px] text-black">

            <${UI.Header} logo=${logo}/>

            <div class="flex flex-col items-start lg:flex-row mt-4 mb-24">
                <${UI.Controls}/>
                <${UI.Chart}>
                    <${UI.Audiogram}/>
                    <div class="absolute left-0 w-full top-full md:( left-auto top-auto -right-[10px] -bottom-[10px])">
                        <${UI.Display}/>
                    </div>
                <//>

            </div>

        </div>
        <//>
    `, ShadowDiv);    
}