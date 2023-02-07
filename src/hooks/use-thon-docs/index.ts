import React from 'react';
import { ThonDocsContext } from '../../providers/thon-docs-provider';

function useThonDocs(): React.ComponentProps<
  typeof ThonDocsContext.Provider
>['value'] {
  const thonDocsContext = React.useContext(ThonDocsContext);

  return thonDocsContext;
}

export default useThonDocs;
