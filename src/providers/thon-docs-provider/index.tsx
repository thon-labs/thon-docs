import React from 'react';
import renderDocumentWrapper, {
  RenderDocumentType,
} from '../../render-document';

export interface IThonDocsContext {
  RenderDocument: RenderDocumentType;
}

/* istanbul ignore next */
export const ThonDocsContext = React.createContext<IThonDocsContext>({
  RenderDocument: null,
});

type Props = {
  modules: any;
  children: React.ReactNode;
};

export const ThonDocsProvider: React.FC<Props> = ({ modules, children }) => {
  const RenderDocument = renderDocumentWrapper({ modules });

  return (
    <ThonDocsContext.Provider value={{ RenderDocument }}>
      {children}
    </ThonDocsContext.Provider>
  );
};

export default ThonDocsProvider;
