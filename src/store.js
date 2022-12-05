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
/** @type {(inFrequency:number)=>Store.ColumnMapping|false} */
export const ColumnLookup =(inFrequency)=>
{
    for(let i=0; i<ColumnMapping.length; i++)
    {
        const map = ColumnMapping[i];
        if(map[0] == inFrequency){ return map; }
    }
    return false;
};


/** @type {(freq:Store.TestFrequency, chan:number, user:boolean)=>Store.TestFrequencySample|undefined} */
export const MarkGet =(freq, chan, user)=> freq[/** @type {Store.PlotKey} */ (`${user ? "User" : "Test"}${chan ? "R" : "L"}`)];

/** @type {(freq:Store.TestFrequency, chan:number, mark:TestFrequencySample|undefined)=>Store.TestFrequencySample|undefined} */
export const MarkSet =(freq, chan, mark)=> freq[ chan ? "UserR" : "UserL" ] = mark;

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
                { Hz: 1000, TestL: { Stim: 50, Resp: true }, TestR: { Stim: 55, Resp: true } }
            ]
        }
    ]
};

/** @type {Record<string, Store.ContextUpdater>} */
const Update =
{
    Freq(inState)
    {
        const column = ColumnMapping[inState.Freq.Value];
        if(column && inState.Live.Test)
        {
            const hz = column[0];
            inState.Live.Freq = undefined;
            for(let i=0; i<inState.Live.Test.Plot.length; i++)
            {
                const plot = inState.Live.Test.Plot[i];
                if(plot.Hz == hz)
                {
                    inState.Live.Freq = plot;
                    return true;
                }
            }
        }
        return false;
    },
    Mark(inState)
    {
        const freq = inState.Live.Freq;
        if(freq)
        {
            inState.Live.Mark = MarkGet(freq, inState.Chan.Value, true);
            return true;
        }
        return false;
    }
};


/** @type {(inTest:Store.Test, inChan:number, inStim:Range, inIsUser:boolean)=>Store.DrawGroup} */
export function Congtiguous(inTest, inChan, inStim, inIsUser)
{
    /** @type {Store.DrawGroup} */
    const output = {Points:[], Paths:[]};

    let plot;
    let valid = false;
    /** @type {Array<Store.DrawPoint>} */
    let segment = [];
    for(let i=0; i<inTest.Plot.length; i++)
    {
        plot = inTest.Plot[i];
        const mark = MarkGet(plot, inChan, inIsUser);
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

                if(mark.Resp)
                {
                    if(!valid)
                    {
                        segment = [];
                        output.Paths.push(segment);
                    }
                    valid = true;
                    segment.push(point);
                }
                else
                {
                    valid = false;
                }
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
        clone.Live.Test = clone.Tests[Data];
        Update.Freq(clone);
        Update.Mark(clone);
        clone.Draw = {
            UserL: Congtiguous(clone.Live.Test, 0, clone.Stim, true ),
            UserR: Congtiguous(clone.Live.Test, 1, clone.Stim, true ),
            TestL: Congtiguous(clone.Live.Test, 0, clone.Stim, false),
            TestR: Congtiguous(clone.Live.Test, 1, clone.Stim, false)
        };
    }
    else if (Name == "Mark")
    {
        if(clone.Live.Test && clone.Live.Freq)
        {
            clone.Live.Mark = MarkSet(clone.Live.Freq, clone.Chan.Value, Data !== null ? {Stim:clone.Stim.Value, Resp:Data} : undefined);

            clone.Draw = {...clone.Draw};
            clone.Draw[clone.Chan.Value == 0 ? "UserL" : "UserR"] = Congtiguous(clone.Live.Test, clone.Chan.Value, clone.Stim, true);
        }
    }
    else if( Name=="Stim" || Name=="Chan" || Name=="Freq")
    {
        const tone = {...clone[Name]};
        tone.Value += Data*tone.Step;
        if(tone.Value < tone.Min){ tone.Value = tone.Min; }
        if(tone.Value > tone.Max){ tone.Value = tone.Max; }
        clone[Name] = tone;
        if(Name != "Stim")
        {
            Update.Freq(clone);
            Update.Mark(clone);
        }
    }

    return clone;
}