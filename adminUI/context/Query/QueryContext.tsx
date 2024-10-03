"use client";

import { createContext, useState } from "react";

export interface IQueryContext {
  queryValue: string[];
  setQueryValue: any;
}

export const queryContext = createContext<IQueryContext>({
  queryValue: [],
  setQueryValue: undefined,
});

export default function QueryContext(props: any) {
  const [queryValue, setQueryValue] = useState<string[]>([]);
  const object = { queryValue, setQueryValue };

  return (
    <queryContext.Provider value={object}>
      {props.children}
    </queryContext.Provider>
  );
}
