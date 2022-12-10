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

/** Creates a new Store.Context object that contain the current selections 
 * @type {(inState:Store.State, inTest?:Store.Test)=>Store.Context} */
const Reselect =(inState, inTest)=>
{
    /** @type {Store.Context} */
    const output = { Test:inTest??inState.Live.Test };
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
                output.Mark = plot[`User${inState.Chan.Value ? "R" : "L"}`];
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
                        X: lookup[1],
                        Y: (mark.Stim - inStim.Min)/(inStim.Max - inStim.Min),
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
            if(line.Head.Mark.Resp && line.Tail.Mark.Resp)
            {
                output.Paths.push(line);
            }
        }
    }
    return output;
}

/** @type {Store.Reducer} */
export function Reducer(inState, inAction)
{
    const clone = {...inState};
    const {Name, Data} = inAction;

    if(Name == "Test")
    {
        const test = clone.Tests[Data];
        clone.Live = Reselect(clone, test);
        clone.Draw = {
            UserL: Redraw(test, 0, clone.Stim, true ),
            UserR: Redraw(test, 1, clone.Stim, true ),
            TestL: Redraw(test, 0, clone.Stim, false),
            TestR: Redraw(test, 1, clone.Stim, false)
        };
    }
    else if (Name == "Mark")
    {
        if(clone.Live.Test && clone.Live.Freq)
        {
            const key = clone.Chan.Value == 0 ? "UserL" : "UserR";
            clone.Live.Mark = Data !== null ? {Stim:clone.Stim.Value, Resp:Data} : undefined;
            clone.Live.Freq[key] = clone.Live.Mark;
            clone.Live.Freq = {...clone.Live.Freq};
            clone.Draw[key] = Redraw(clone.Live.Test, clone.Chan.Value, clone.Stim, true);
        }
    }
    else if( Name=="Stim" || Name=="Chan" || Name=="Freq")
    {
        const tone = {...clone[Name]};
        tone.Value += Data*tone.Step;
        tone.Value = Math.max(tone.Value, tone.Min);
        tone.Value = Math.min(tone.Value, tone.Max);
        clone[Name] = tone;
        clone.Live = Reselect(clone);
    }

    return clone;
}

/** @type {Store.State} */
export const Initial =
{
    Chan: { Min:0,   Max:1,   Value:0,  Step:1 },
    Freq: { Min:2,   Max:8,   Value:2,  Step:1 },
    Stim: { Min:-10, Max:120, Value:30, Step:5 },
    Live:
    {
        Test: undefined,
        Freq: undefined,
        Mark: undefined
    },
    Draw:
    {
        UserL:{Points:[], Paths:[]},
        UserR:{Points:[], Paths:[]},
        TestL:{Points:[], Paths:[]},
        TestR:{Points:[], Paths:[]}
    },
    Tests: [
        {
            Name: "Patient A  Asymmetric Notch",
            Plot:
            [
                { Hz: 500,  TestL: { Stim: 30, Resp: true }, TestR: { Stim: 50, Resp: true } },
                { Hz: 1000, TestL: { Stim: 50, Resp: true }, TestR: { Stim: 55, Resp: true } },
                { Hz: 2000, TestL: { Stim: 50, Resp: true }, TestR: { Stim: 55, Resp: true } },
                { Hz: 3000, TestL: { Stim: 50, Resp: true }, TestR: { Stim: 55, Resp: true } },
                { Hz: 4000, TestL: { Stim: 50, Resp: true }, TestR: { Stim: 55, Resp: true } },
                { Hz: 6000, TestL: { Stim: 50, Resp: true }, TestR: { Stim: 55, Resp: true } },
                { Hz: 8000, TestL: { Stim: 50, Resp: true }, TestR: { Stim: 55, Resp: true } }
            ]
        }
    ]
};

/** @type {preact.Context<Store.Binding>} */
export const Context = React.createContext([Initial, (_a)=>{}]);

/** @type {(props:{children:preact.ComponentChildren})=>preact.VNode} */
export const Provider =(props)=>
{
    /** @type {Store.Binding} */
    const reducer = React.useReducer(Reducer, Initial, ()=>Reducer(Initial, {Name:"Test", Data:0}));
    return React.createElement(Context.Provider, {value:reducer, children:props.children});
};

/** @type {()=>Store.Binding} */
export const Consumer =()=> React.useContext(Context);