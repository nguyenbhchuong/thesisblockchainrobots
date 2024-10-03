"use client";

import { createContext, useState } from "react";

export interface IImportContext {
  importObjects: { [key: number]: IImportObject };
  setImportObjects: any;
}

export interface IImportObject {
  facultyYear: string;
  file: File;
}
export const importContext = createContext<IImportContext>({
  importObjects: {},
  setImportObjects: undefined,
});

export default function ImportContext(props: any) {
  const [importObjects, setImportObjects] = useState<{
    [key: number]: IImportObject;
  }>({});
  const object = { importObjects, setImportObjects };

  return (
    <importContext.Provider value={object}>
      {props.children}
    </importContext.Provider>
  );
}
