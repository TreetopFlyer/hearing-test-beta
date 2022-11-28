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
}

/** @typedef {{Stim:number, Resp:boolean}} TestFrequencySample */
/** @typedef {{Hz:number, TestL:TestFrequencySample, TestR:TestFrequencySample, UserL?:TestFrequencySample, UserR?:TestFrequencySample}} TestFrequency */
/** @typedef {{Name:string, Plot:Array<TestFrequency>}} Test */
/** @typedef {{Test?:Test, Freq?:TestFrequency, Mark?:TestFrequencySample}} Context */
/** @typedef {{Chan:"left"|"right", Freq:number, Stim:number, Selection:Context, Tests:Array<Test>}} State */
/** @type {State} */
export const Initial =
{
    Chan: "left",
    Freq: 3,
    Stim: 30,
    Selection:
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

/** @typedef {{Name:"Mark", Data:boolean|undefined}} ActionMark */
/** @typedef {{Name:"Test", Data:number}} ActionTest*/
/** @typedef {ActionMark|ActionTest} Action */
/** @typedef {(inState:State, inAction:Action)=>State} Reducer */
/** @typedef {(inState:State)=>boolean} SelectionUpdater */
/** @type {Record<string, SelectionUpdater>} */
const Update = {
    Freq(inState)
    {
        const column = ColumnMapping[inState.Freq];
        if(column && inState.Selection.Test)
        {
            const hz = column[0];
            inState.Selection.Freq = undefined;
            for(let i=0; i<inState.Selection.Test.Plot.length; i++)
            {
                const plot = inState.Selection.Test.Plot[i];
                if(plot.Hz == hz)
                {
                    inState.Selection.Freq = plot;
                    return true;
                }
            }
        }
        return false;
    },
    Mark(inState)
    {
        const freq = inState.Selection.Freq;
        if(freq)
        {
            if(inState.Chan == "left" && freq.UserL)
            {
                inState.Selection.Mark = freq.UserL;
                return true;
            }
            else if(inState.Chan == "right" && freq.UserR)
            {
                inState.Selection.Mark = freq.UserR;
                return true;
            }
        }
        return false;
    }
};
/** @type {Reducer} */
export function Reducer(inState, inAction)
{
    const clone = {...inState};

    switch(inAction.Name)
    {
        case "Test" :
        {
            clone.Selection.Test = clone.Tests[inAction.Data];
            Update.Freq(clone);
            Update.Mark(clone);
            break;
        }
    }
    return clone;
}