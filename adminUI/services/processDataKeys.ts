export interface IKeyStore {
  [key: string]: string[];
}

export default function resolveDataKeys(newDataKeys: string[]) {
  let keysByFaculty: IKeyStore = {};
  let keysByIntake: IKeyStore = {};

  //solve keyByFaculty
  newDataKeys.map((value: string) => {
    if (value.substring(0, 5) === "Note:") {
      keysByFaculty = { ...keysByFaculty, [value]: [] };
      return;
    }
    const faculty = value.substring(0, 3);
    const intake = value.substring(3, 7);
    if (faculty in keysByFaculty) {
      keysByFaculty[faculty] = [...keysByFaculty[faculty], intake];

      return;
    }
    keysByFaculty = { ...keysByFaculty, [faculty]: [intake] };
  });

  console.log("=========data inside=============");
  console.log(newDataKeys);
  console.log("====================================");

  //solve key by intake
  newDataKeys.map((value: string) => {
    if (value.substring(0, 5) === "Note:") {
      return;
    }
    const faculty = value.substring(0, 3);
    const intake = value.substring(3, 7);
    if (intake in keysByIntake) {
      keysByIntake[intake] = [...keysByIntake[intake], faculty];
      return;
    }
    keysByIntake = { ...keysByIntake, [intake]: [faculty] };
  });

  return { keysByFaculty, keysByIntake };
}
