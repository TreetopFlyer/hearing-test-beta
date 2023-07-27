import React from "react";

const size = 1/6;
/** @type {Array<Store.ColumnMapping>} */
export const ColumnMapping = [
    [ 125, size*0.0, true ],
    [ 250, size*1.0, true ],
    [ 500, size*2.0, true ],
    [1000, size*3.0, true ],
    [2000, size*4.0, true ],
    [3000, size*4.5, false],
    [4000, size*5.0, true ],
    [6000, size*5.5, false],
    [8000, size*6.0, true ]
];
/** Looks up a frequency in ColumnMapping
 *  @type {(inFrequency:number)=>Store.ColumnMapping|false} */
export const ColumnLookup =(inFrequency)=>
{
    for(let i=0; i<ColumnMapping.length; i++)
    {
        const map = ColumnMapping[i];
        if(map[0] == inFrequency){ return map; }
    }
    return false;
};

/** @type {(inDecimal:number)=>string} */
const Perc =(inDecimal)=> `${inDecimal*100}%`;

/** @type {(inTest:Store.Test)=>Store.Grade} */
export const Grade =(inTest)=>
{
    /** @type {Store.Grade} */
    const output = { Total:0, Marks:0, Score:0 };

    /** @type {(inGoal:number, inResult:number)=>number} */
    const Mapper =(inGoal, inResult)=>
    {
        const err = Math.abs(inGoal-inResult);
        if(err == 0){ return 1; }
        else if(err > 0 && err <= 5){ return 0.5; }
        else{ return 0; }
    }


    for(let i=0; i<inTest.Plot.length; i++)
    {
        const {TestL, TestR, UserL, UserR} = inTest.Plot[i];
        if(TestL)
        {
            output.Total ++;
            if(UserL)
            {
                output.Marks++;
                output.Score += Mapper(TestL.Stim, UserL.Stim);
            }
        }
        if(TestR)
        {
            output.Total ++;
            if(UserR)
            {
                output.Marks++;
                output.Score += Mapper(TestR.Stim, UserR.Stim);
            }
        }
    }
    if(output.Marks > 0)
    {
        output.Score = Math.floor((output.Score/output.Marks) * 10000)/100;
    }

    return output;

}


const ErrorCol = 
    [30,   25,   20,   15,   10,   5,    0,    -5,   -10,  -15 ]
const ErrorLUT = [
    [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00],
    [0.00, 0.00, 0.00, 0.00, 0.10, 0.15, 0.10, 0.10, 0.00, 0.00],
    [0.00, 0.00, 0.02, 0.05, 0.15, 0.20, 0.30, 0.15, 0.05, 0.00],
    [0.00, 0.02, 0.05, 0.10, 0.20, 0.40, 0.60, 0.30, 0.05, 0.00]
];
/** @type {(inState:Store.State)=>void} */
const ErrorProbability =(inState)=>
{
    const miss = inState.Stim.Value - (inState.Live.Mark.Test?.Stim ?? inState.Stim.Value);
    inState.Live.Mark.Errs = ErrorLUT[inState.Errs]?.[ErrorCol.indexOf(miss)] ?? 0;
}


/** Creates a new Store.Context object that contain the current selections 
 * @type {(inState:Store.State, inTest?:Store.Test)=>Store.Context} */
const Reselect =(inState, inTest)=>
{
    /** @type {Store.Context} */
    const output = { Test:inTest??inState.Live.Test, Mark:{User:undefined, Errs:0} };
    const column = ColumnMapping[inState.Freq.Value];
    if(column && output.Test)
    {
        const hz = column[0];
        for(let i=0; i<output.Test.Plot.length; i++)
        {
            const plot = output.Test.Plot[i];
            if(plot.Hz == hz)
            {
                output.Freq = plot;
                output.Mark.User = inState.Chan.Value ? plot.UserR : plot.UserL;
                output.Mark.Test = inState.Chan.Value ? plot.TestR : plot.TestL;
                break;
            }
        }
    }
    return output;
};

/** Creates a new Store.DrawGroup object for the given Test and settings
 * @type {(inTest:Store.Test|undefined, inChan:number, inStim:Store.Range, inIsUser:boolean)=>Store.DrawGroup} */
const Redraw =(inTest, inChan, inStim, inIsUser)=>
{
    /** @type {Store.DrawGroup} */
    const output = {Points:[], Paths:[]};

    if(inTest)
    {
        let plot;
        for(let i=0; i<inTest.Plot.length; i++)
        {
            plot = inTest.Plot[i];
            const mark = plot[`${inIsUser ? "User" : "Test"}${inChan ? "R" : "L"}`]
            if(mark)
            {
                const lookup = ColumnLookup(plot.Hz);
                if(lookup)
                {
                    /** @type {Store.DrawPoint} */
                    const point = {
                        X: Perc(lookup[1]),
                        Y: Perc((mark.Stim - inStim.Min)/(inStim.Max - inStim.Min)),
                        Mark: mark
                    };
                    output.Points.push(point);
                }
            }
        }
        for(let i=1; i<output.Points.length; i++)
        {
            /** @type {Store.DrawLine} */
            const line = {Head:output.Points[i-1], Tail:output.Points[i]};
            if(line.Head.Mark?.Resp && line.Tail.Mark?.Resp)
            {
                output.Paths.push(line);
            }
        }
    }
    return output;
};

/** Create a new cursor position from the state
 * @type {(inState:Store.State)=>Store.DrawPoint} */
const Reposition =(inState)=> ({
    X: Perc(ColumnMapping[inState.Freq.Value][1]),
    Y: Perc((inState.Stim.Value - inState.Stim.Min)/(inState.Stim.Max - inState.Stim.Min))
});

/** @type {Store.Reducer} */
export function Reducer(inState, inAction)
{
    const clone = {...inState};
    const {Name, Data} = inAction;

    if(Name == "Test")
    {
        const test = clone.Test[Data];
        if(test)
        {
            clone.Pick = Data;
            clone.Live = Reselect(clone, test);
            clone.Draw =
            {
                Cross: Reposition(clone),
                UserL: Redraw(test, 0, clone.Stim, true ),
                UserR: Redraw(test, 1, clone.Stim, true ),
                TestL: Redraw(test, 0, clone.Stim, false),
                TestR: Redraw(test, 1, clone.Stim, false)
            };
            test.Done = Grade(test);
            SaveTests(clone);
        }
    }
    else if (Name == "Mark")
    {
        if(clone.Live.Test && clone.Live.Freq)
        {
            const key = clone.Chan.Value == 0 ? "UserL" : "UserR";
            clone.Live.Mark.User = Data !== null ? {Stim:clone.Stim.Value, Resp:Data} : undefined;
            clone.Live.Freq[key] = clone.Live.Mark.User;
            clone.Draw[key] = Redraw(clone.Live.Test, clone.Chan.Value, clone.Stim, true);
            clone.Live.Test.Done = Grade(clone.Live.Test);
            SaveTests(clone);
        }
    }
    else if( Name=="Stim" || Name=="Chan" || Name=="Freq")
    {
        const tone = clone[Name];
        tone.Value += Data*tone.Step;
        tone.Value = Math.max(tone.Value, tone.Min);
        tone.Value = Math.min(tone.Value, tone.Max);

        clone.Draw.Cross = Reposition(clone);
        if(Name != "Stim")
        {
            clone.Live = Reselect(clone);
        }
    }
    else if (Name == "Errs")
    {
        clone.Errs = Data;
    }
    else if (Name == "Kill")
    {
        if(clone.Live.Test)
        {
            clone.Live.Test.Plot.forEach(freq=>
            {
                freq.UserL = undefined;
                freq.UserR = undefined;
            });
            clone.Draw["UserL"] = Redraw(clone.Live.Test, clone.Chan.Value, clone.Stim, true);
            clone.Draw["UserR"] = Redraw(clone.Live.Test, clone.Chan.Value, clone.Stim, true);
            clone.Live.Test.Done = Grade(clone.Live.Test);
            SaveTests(clone);
        }
    }
    else if (Name == "ShowCursor")
    {
        clone.Show.Cursor = Data;
    }
    else if (Name == "ShowAnswer")
    {
        clone.Show.Answer = Data;
    }

    ErrorProbability(clone);
    SaveSettings(clone);

    document.dispatchEvent(new CustomEvent("EarmarkUpdate", {detail:clone}));
    return clone;
}


/** @type {Store.Test[]} */
const TestDefault = [
    {
        Name: "Patient A  Asymmetric Notch",
        Plot:
        [
            { Hz: 500,  TestL: { Stim: 15, Resp: true }, TestR: { Stim: 10, Resp: true } },
            { Hz: 1000, TestL: { Stim: 10, Resp: true }, TestR: { Stim: 10, Resp: true } },
            { Hz: 2000, TestL: { Stim: 15, Resp: true }, TestR: { Stim: 20, Resp: true } },
            { Hz: 3000, TestL: { Stim: 30, Resp: true }, TestR: { Stim: 40, Resp: true } },
            { Hz: 4000, TestL: { Stim: 40, Resp: true }, TestR: { Stim: 55, Resp: true } },
            { Hz: 6000, TestL: { Stim: 35, Resp: true }, TestR: { Stim: 40, Resp: true } },
            { Hz: 8000, TestL: { Stim: 20, Resp: true }, TestR: { Stim: 15, Resp: true } }
        ]
    },
    {
        Name: "Patient B High Freq Hearing Loss",
        Plot:
        [
            { Hz: 500,  TestL: { Stim: 10, Resp: true }, TestR: { Stim: 10, Resp: true } },
            { Hz: 1000, TestL: { Stim: 15, Resp: true }, TestR: { Stim: 10, Resp: true } },
            { Hz: 2000, TestL: { Stim: 10, Resp: true }, TestR: { Stim: 15, Resp: true } },
            { Hz: 3000, TestL: { Stim: 25, Resp: true }, TestR: { Stim: 20, Resp: true } },
            { Hz: 4000, TestL: { Stim: 35, Resp: true }, TestR: { Stim: 35, Resp: true } },
            { Hz: 6000, TestL: { Stim: 50, Resp: true }, TestR: { Stim: 55, Resp: true } },
            { Hz: 8000, TestL: { Stim: 80, Resp: true }, TestR: { Stim: 75, Resp: true } }
        ]
    },
    {
        Name: "Patient C Unilateral Hearing Loss",
        Plot:
        [
            { Hz: 500,  TestL: { Stim: 15, Resp: true }, TestR: { Stim: 40, Resp: true } },
            { Hz: 1000, TestL: { Stim: 15, Resp: true }, TestR: { Stim: 50, Resp: true } },
            { Hz: 2000, TestL: { Stim: 20, Resp: true }, TestR: { Stim: 65, Resp: true } },
            { Hz: 3000, TestL: { Stim: 15, Resp: true }, TestR: { Stim: 70, Resp: true } },
            { Hz: 4000, TestL: { Stim: 20, Resp: true }, TestR: { Stim: 65, Resp: true } },
            { Hz: 6000, TestL: { Stim: 25, Resp: true }, TestR: { Stim: 60, Resp: true } },
            { Hz: 8000, TestL: { Stim: 20, Resp: true }, TestR: { Stim: 45, Resp: true } }
        ]
    },
    {
        Name: "Patient D Normal Hearing",
        Plot:
        [
            { Hz: 500,  TestL: { Stim:  5, Resp: true }, TestR: { Stim: 10, Resp: true } },
            { Hz: 1000, TestL: { Stim:  0, Resp: true }, TestR: { Stim:  5, Resp: true } },
            { Hz: 2000, TestL: { Stim:  5, Resp: true }, TestR: { Stim:  5, Resp: true } },
            { Hz: 3000, TestL: { Stim: 15, Resp: true }, TestR: { Stim: 10, Resp: true } },
            { Hz: 4000, TestL: { Stim: 15, Resp: true }, TestR: { Stim: 15, Resp: true } },
            { Hz: 6000, TestL: { Stim:  5, Resp: true }, TestR: { Stim: 10, Resp: true } },
            { Hz: 8000, TestL: { Stim:  0, Resp: true }, TestR: { Stim:  5, Resp: true } }
        ]
    }
];

let PreviewData = false;
const PreviewText = atob(new URL(window.location.href).searchParams.get("test")||"");
if(PreviewText)
{
    try
    {
        PreviewData = JSON.parse(PreviewText);
    }
    catch(e)
    {
        alert(`Could not read test data`);
        PreviewData = false;
    }    
}

const AppVersion = `0.0.0`;
const savedVersion = localStorage.getItem("app-version");
if(savedVersion && (AppVersion > savedVersion))
{
    console.log(`New version "${AppVersion}"; clearing saved session.`);
    localStorage.clear();
}
localStorage.setItem("app-version", AppVersion);

/** @type {Store.Test[]} */
const TestActual = PreviewData ? PreviewData : JSON.parse(localStorage.getItem("app-tests")||"false") || TestDefault;
/**@type {(inState:Store.State)=>void} */
const SaveTests =(inState)=>
{
    if(!PreviewData)
    {
        localStorage.setItem("app-tests", JSON.stringify(inState.Test));
    }
}

/** @type {Store.StatePartSimple} */
const SettingsDefault =
{
    Chan: { Min:0,   Max:1,   Value:0,  Step:1 },
    Freq: { Min:2,   Max:8,   Value:3,  Step:1 },
    Stim: { Min:-10, Max:120, Value:30, Step:5 },
    Errs: 0,
    Pick: 0,
    Show: { Cursor:true, Answer:false }
};
/** @type {Store.StatePartSimple} */
const SettingsActual = PreviewData ? SettingsDefault : JSON.parse(localStorage.getItem("app-settings")||"false") || SettingsDefault;
/**@type {(inState:Store.State)=>void} */
const SaveSettings =(inState)=>
{
    if(!PreviewData)
    {
        /** @type {Store.StatePartSimple} */
        const clone = {
            Chan:inState.Chan,
            Freq:inState.Freq,
            Stim:inState.Stim,
            Errs:inState.Errs,
            Pick:inState.Pick,
            Show:inState.Show
        };
        localStorage.setItem("app-settings", JSON.stringify(clone));      
    }
};

export const Initial = Reducer(
{
    ...SettingsActual,
    Test: TestActual,
    Live:
    {
        Test: undefined,
        Freq: undefined,
        Mark: {User: undefined, Errs:0}
    },
    Draw:
    {
        UserL:{Points:[], Paths:[]},
        UserR:{Points:[], Paths:[]},
        TestL:{Points:[], Paths:[]},
        TestR:{Points:[], Paths:[]}
    }
}, {Name:"Test", Data:SettingsActual.Pick});


export const Context = React.createContext(/** @type {Store.Binding} */([Initial, (_a)=>{}]));

/** @type {(props:{children:preact.ComponentChildren})=>preact.VNode} */
export const Provider =(props)=>
{
    /** @type {Store.Binding} */
    const reducer = React.useReducer(Reducer, Initial);
    return React.createElement(Context.Provider, {value:reducer, children:props.children});
};

/** @type {()=>Store.Binding} */
export const Consumer =()=> React.useContext(Context);