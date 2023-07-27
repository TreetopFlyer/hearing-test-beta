declare namespace Store {
  type ColumnMapping = [frequency: number, position: number, normal: boolean];

  type Range = { Min: number; Max: number; Value: number; Step: number };
  type TestFrequencySample = { Stim: number; Resp: boolean };

  type TestFrequency = {
    Hz: number;
    TestL: TestFrequencySample;
    TestR: TestFrequencySample;
    UserL?: TestFrequencySample;
    UserR?: TestFrequencySample;
  };

  type Test = {
    Name : string;
    Done?: Grade;
    Plot : Array<TestFrequency>
  };

  type Context = {
    Test?: Test;
    Freq?: TestFrequency;
    Mark:
    {
      User?: TestFrequencySample,
      Test?: TestFrequencySample,
      Errs : number
    }
  };
  
  type StatePartSimple =
  {
    Chan: Range;
    Freq: Range;
    Stim: Range;
    Errs: number;
    Pick: number;
    Mute: boolean;
    Show:
    {
      Cursor:boolean,
      Answer:boolean
    }
  };
  type StatePartComplex =
  {
    Live: Context;
    Draw: DrawChart;
    Test: Array<Test>;
  };

  type State = StatePartSimple & StatePartComplex;

  type ActionMark = { Name: "Mark"; Data: boolean | null };
  type ActionTest = { Name: "Test"; Data: number };
  type ActionChan = { Name: "Chan"; Data: number };
  type ActionFreq = { Name: "Freq"; Data: number };
  type ActionStim = { Name: "Stim"; Data: number };
  type ActionErrs = { Name: "Errs"; Data: number };
  type ActionKill = { Name: "Kill"; Data: number };
  type ActionMute = { Name: "Mute"; Data: boolean };
  type ActionShowCursor = {Name: "ShowCursor", Data:boolean};
  type ActionShowAnswer = {Name: "ShowAnswer", Data:boolean};
  type Action = ActionMark | ActionTest | ActionChan | ActionFreq | ActionStim | ActionErrs | ActionKill | ActionMute | ActionShowCursor | ActionShowAnswer;
  type Reducer = (inState: State, inAction: Action) => State;
  type ContextUpdater = (inState: State) => boolean;

  type PlotKeyUser = "UserL" | "UserR";
  type PlotKeyTest = "TestL" | "TestR";
  type PlotKey = PlotKeyUser | PlotKeyTest;

  type DrawPoint = { X: string; Y: string; Mark?: TestFrequencySample };
  type DrawLine = { Head:DrawPoint, Tail:DrawPoint};
  type DrawGroup = { Points: Array<DrawPoint>; Paths: Array<DrawLine> };
  type DrawChart = { Cross?:DrawPoint, UserL: DrawGroup, UserR: DrawGroup, TestL: DrawGroup, TestR: DrawGroup };

  type Binding = [state:State, dispatch:(inAction:Action)=>void]

  type Grade = {
    Total:number,
    Marks:number,
    Score:number
  };
}