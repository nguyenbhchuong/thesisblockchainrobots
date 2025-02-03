interface ITask {
  id: number;
  good: string;
  origin: string;
  destination: string;
  assigner: number;
  validator: number;
  stage: number;
  timeIssued: number;
  timeStarted: number;
  timeDelivered: number;
}

interface IRobot {
  id: number;
  address: string;
  status: number;
  credit: number;
}

interface ILocation {
  id: string;
  x: number;
  y: number;
  goods: string[];
}

export type { ITask, IRobot, ILocation };
