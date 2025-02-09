import React from 'react';

const RadioTabs = ({ activeTab, setActiveTab }) => {
    return (
      <div className="tabs">
        <a 
          className={`tab tab-bordered ${activeTab === 'tab1' ? 'tab-active' : ''}`} 
          onClick={() => setActiveTab('tab1')}
        >
          Tab 1
        </a>
        <a 
          className={`tab tab-bordered ${activeTab === 'tab2' ? 'tab-active' : ''}`} 
          onClick={() => setActiveTab('tab2')}
        >
          Tab 2
        </a>
        {/* Add more tabs as needed */}
        
        <div className="tab-content">
          {activeTab === 'tab1' && (
            <div>
              <h2>Content for Tab 1</h2>
              <p>This is the content for the first tab.</p>
            </div>
          )}
          {activeTab === 'tab2' && (
            <div>
              <h2>Content for Tab 2</h2>
              <p>This is the content for the second tab.</p>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default RadioTabs;