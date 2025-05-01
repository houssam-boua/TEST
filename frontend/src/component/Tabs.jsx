import React from 'react'

const Tabs = () => {
  return (
    <div role='tablist' className='tabs tabs-border'>
      <a role='tab' className='tab'>
        Tab 1
      </a>
      <a role='tab' className='tab tab-active'>
        Tab 2
      </a>
      <a role='tab' className='tab'>
        Tab 3
      </a>
    </div>
  );
}

export default Tabs
