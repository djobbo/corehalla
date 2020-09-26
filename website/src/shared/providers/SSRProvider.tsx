import React, { createContext, useState, FC, PropsWithChildren, SetStateAction, Dispatch } from 'react';

interface ISSRContext {
    errors: string[];
    data: any;
}

export const SSRContext = createContext<{
    ssrContext: ISSRContext;
    setSSRContext: Dispatch<SetStateAction<ISSRContext>>;
}>(null);

interface Props {
    context?: ISSRContext;
}

export const SSRProvider: FC<PropsWithChildren<Props>> = ({ children, context }: PropsWithChildren<Props>) => {
    const [ssrContext, setSSRContext] = useState<ISSRContext>(context);
    console.log('HELLO', ssrContext);
    return <SSRContext.Provider value={{ ssrContext, setSSRContext }}>{children}</SSRContext.Provider>;
};
