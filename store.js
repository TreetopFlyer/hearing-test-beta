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
/** @type {Reducer} */
export function Reducer(inState, inAction)
{
    const clone = {...inState};
    switch(inAction.Name)
    {
        case "Test" :
        {

            let selTest = clone.Tests[inAction.Data];
            let selFreq = undefined;
            let selMark = undefined;
            const column = ColumnLookup(clone.Freq);
            if(column)
            {
                let hz = column[0];
                let plot;
                for(let i=0; i<selTest.Plot.length; i++)
                {
                    plot = selTest.Plot[i];
                    if(plot.Hz == hz)
                    {
                        selFreq = plot;
                        if(clone.Chan == "left" && selFreq.UserL)
                        {
                            selMark = selFreq.UserL;
                        }
                        else if(clone.Chan == "right" && selFreq.UserR)
                        {
                            selMark = selFreq.UserR;
                        }
                    }
                }
            }
            const freq = test.Plot[]
            //clone.Selection = {...clone.Selection, Test:clone.Tests[inAction.Data]}
            break;
        }
        case "Mark" :
        {
            if(clone.Test)
            {
                clone.Test.Plot

            }
        }
    }
    return clone;
}