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
            clone.TestIndex = Data;
            clone.Live = Reselect(clone, test);
            clone.Draw =
            {
                Cross: Reposition(clone),
                UserL: Redraw(test, 0, clone.Stim, true ),
                UserR: Redraw(test, 1, clone.Stim, true ),
                TestL: Redraw(test, 0, clone.Stim, false),
                TestR: Redraw(test, 1, clone.Stim, false)
            };
        }
    }
    else if (Name == "Mark")
    {
        if(clone.Live.Test && clone.Live.Freq)
        {
            const key = clone.Chan.Value == 0 ? "UserL" : "UserR";
            clone.Live.Mark = Data !== null ? {Stim:clone.Stim.Value, Resp:Data} : undefined;
            clone.Live.Freq[key] = clone.Live.Mark;
            clone.Draw[key] = Redraw(clone.Live.Test, clone.Chan.Value, clone.Stim, true);
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
    else if (Name == "ShowCursor")
    {
        clone.Show.Cursor = Data;
    }
    else if (Name == "ShowAnswer")
    {
        clone.Show.Answer = Data;
    }

    return clone;
}

/** @type {Store.State} */
export const Initial = Reducer(
{
    Chan: { Min:0,   Max:1,   Value:0,  Step:1 },
    Freq: { Min:2,   Max:8,   Value:3,  Step:1 },
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
    Show:
    {
        Cursor:true,
        Answer:false
    },
    TestIndex: 0,
    Test: [
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
    ]
}, {Name:"Test", Data:0});

/** @type {preact.Context<Store.Binding>} */
export const Context = React.createContext([Initial, (_a)=>{}]);

/** @type {(props:{children:preact.ComponentChildren})=>preact.VNode} */
export const Provider =(props)=>
{
    /** @type {Store.Binding} */
    const reducer = React.useReducer(Reducer, Initial);
    return React.createElement(Context.Provider, {value:reducer, children:props.children});
};

/** @type {()=>Store.Binding} */
export const Consumer =()=> React.useContext(Context);

/** @type {(inTest:Store.Test|undefined)=>Store.Grade} */
export const Grade =(inTest)=>
{
    /** @type {Store.Grade} */
    const output = { Total:0, Done:0, Score:0 };

    /** @type {(inGoal:number, inResult:number)=>number} */
    const Mapper =(inGoal, inResult)=>
    {
        const err = Math.abs(inGoal-inResult);
        if(err == 0){ return 1; }
        else if(err > 0 && err <= 5){ return 0.9; }
        else if(err > 5 && err <= 10){ return 0.7; }
        else if(err > 10 && err <= 15){ return 0.2; }
        else{ return 0; }
    }

    if(inTest)
    {
        for(let i=0; i<inTest.Plot.length; i++)
        {
            const {TestL, TestR, UserL, UserR} = inTest.Plot[i];
            if(TestL)
            {
                output.Total ++;
                if(UserL)
                {
                    output.Done++;
                    output.Score += Mapper(TestL.Stim, UserL.Stim);
                }
            }
            if(TestR)
            {
                output.Total ++;
                if(UserR)
                {
                    output.Done++;
                    output.Score += Mapper(TestR.Stim, UserR.Stim);
                }
            }
        }
    }

    if(output.Done > 0)
    {
        output.Score = Math.floor((output.Score/output.Done) * 10000)/100;
    }

    return output;
}