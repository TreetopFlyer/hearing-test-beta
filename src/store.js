//@ts-check

const size = 100/6;
/** @typedef {[frequency:number, position:number, normal:boolean]} ColumnMapping  */
/** @type {Array<ColumnMapping>} */
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
/** @type {(inFrequency:number)=>ColumnMapping|false} */
export const ColumnLookup =(inFrequency)=>
{
    for(let i=0; i<ColumnMapping.length; i++)
    {
        const map = ColumnMapping[i];
        if(map[0] == inFrequency){ return map; }
    }
    return false;
};

/** @typedef {{Min:number, Max:number}} Limit */
/** @type {Record<string, Limit>} */
export const ToneLimit =
{
    Freq: { Min: 0,   Max: ColumnMapping.length-1 },
    Stim: { Min: -10, Max: 120 },
    Chan: { Min: 0,   Max: 1},
};
/** @type {(inValue:number, inLimit:Limit)=>number} */
export const ApplyLimit =(inValue, inLimit)=>
{
    if(inValue < inLimit.Min){ return inLimit.Min; }
    else if(inValue > inLimit.Max) { return inLimit.Max; }
    else{ return inValue; }
}

/** @typedef {(freq:TestFrequency, chan:number)=>TestFrequencySample|undefined} MarkLookup */
/** @type {Record<string, MarkLookup>} */
export const ChanMark =
{
    User: (freq, chan)=> chan == 0 ? freq.UserL : freq.UserR,
    Test: (freq, chan)=> chan == 0 ? freq.TestL : freq.TestR
};


/** @typedef {{Stim:number, Resp:boolean}} TestFrequencySample */
/** @typedef {{Hz:number, TestL:TestFrequencySample, TestR:TestFrequencySample, UserL?:TestFrequencySample, UserR?:TestFrequencySample}} TestFrequency */
/** @typedef {{Name:string, Plot:Array<TestFrequency>}} Test */
/** @typedef {{Test?:Test, Freq?:TestFrequency, Mark?:TestFrequencySample}} Context */
/** @typedef {{Chan:number, Freq:number, Stim:number, Live:Context, Tests:Array<Test>}} State */
/** @type {State} */
export const Initial =
{
    Chan: 0,
    Freq: 3,
    Stim: 30,
    Live:
    {
        Test: undefined,
        Freq: undefined,
        Mark: undefined
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

/** @typedef {{Name:"Mark", Data:boolean|null}} ActionMark */
/** @typedef {{Name:"Test", Data:number}} ActionTest */
/** @typedef {{Name:"Chan", Data:number}} ActionChan */
/** @typedef {{Name:"Freq", Data:number}} ActionFreq */
/** @typedef {{Name:"Stim", Data:number}} ActionStim */
/** @typedef {ActionMark|ActionTest|ActionChan|ActionFreq|ActionStim} Action */
/** @typedef {(inState:State, inAction:Action)=>State} Reducer */
/** @typedef {(inState:State)=>boolean} SelectionUpdater */
/** @type {Record<string, SelectionUpdater>} */
const Update =
{
    Freq(inState)
    {
        const column = ColumnMapping[inState.Freq];
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
            inState.Live.Mark = inState.Chan == 0 ? freq.UserL : freq.UserR;
            return true;
        }
        return false;
    }
};
/** @type {Reducer} */
export function Reducer(inState, inAction)
{
    const clone = {...inState};
    const {Name, Data} = inAction;

    if(Name == "Test")
    {
        clone.Live.Test = clone.Tests[Data];
        Update.Freq(clone);
        Update.Mark(clone);
    }
    else if (Name == "Mark")
    {
        if(clone.Live.Freq)
        {
            const channelKey = clone.Chan == 0 ? "UserL" : "UserR";
            const channelVal = Data !== null ? {Stim:clone.Stim, Resp:Data} : undefined;
            clone.Live.Mark = clone.Live.Freq[channelKey] = channelVal;
        }
    }
    else if( Name=="Stim" || Name=="Chan" || Name=="Freq")
    {
        clone[Name] = ApplyLimit(Data, ToneLimit[Name]);
        if(Name != "Stim")
        {
            Update.Freq(clone);
            Update.Mark(clone);
        }
    }

    return clone;
}