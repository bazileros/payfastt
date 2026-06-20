import { type ReactNode, createContext, useContext } from "react";
import type { ComponentApi } from "../component/_generated/component.js";

const PayfastContext = createContext<ComponentApi | null>(null);

export function PayfastProvider({
  component,
  children,
}: {
  component: ComponentApi;
  children: ReactNode;
}) {
  return (
    <PayfastContext.Provider value={component}>
      {children}
    </PayfastContext.Provider>
  );
}

export function usePayfast(): ComponentApi {
  const component = useContext(PayfastContext);
  if (!component) {
    throw new Error(
      "usePayfast() must be used within a <PayfastProvider>. " +
        "Wrap your app with <PayfastProvider component={payfastComponent}> " +
        "to use context-based hooks.",
    );
  }
  return component;
}
