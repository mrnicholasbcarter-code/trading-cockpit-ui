import '@testing-library/jest-dom';
import React from 'react';

jest.mock('react-window', () => ({
  FixedSizeList: ({ children, itemCount, itemSize }: any) => {
    return React.createElement(
      'div',
      { "data-testid": "mock-react-window-list" },
      Array.from({ length: Math.min(itemCount, 5) }).map((_, index) => 
        children({ index, style: { height: itemSize, top: index * itemSize } })
      )
    );
  }
}));
