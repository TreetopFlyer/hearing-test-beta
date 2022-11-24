//@ts-check
/** @typedef {[f1:ListEntry, f2:ListEntry, f3:ListEntry, f4:ListEntry, f5:ListEntry, f6:ListEntry, f7:ListEntry]} FreqList */
/** @typedef {number|TestMark} ListEntry */
/** @typedef {{Name:string, Sample:{Left:FreqList, Right:FreqList}, Answer?:{Left:FreqList, Right:FreqList}}} Test */
/** @typedef {{Stim:number|null, Resp:boolean}|null} TestMark*/

/** @type FreqList */
export const Frequencies = [500, 1000, 2000, 3000, 4000, 6000, 8000];
/** @type Array<Test> */
export const Tests = [
    {
        Name: "Patient A  Asymmetric Notch",
        Sample:{
             Left:[15, 10, 15, 30, 40, 35, 20],
            Right:[10, 10, 20, 40, 55, 40, 15]
        }
    }
];

export const Controls =
{
    Test:0,
    Channel: "left",
    Frequency: 1,
    Stimulus: 30
};

function Reducer(inState, inAction)
{

}