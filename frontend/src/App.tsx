import React from 'react';
import SetManager from 'components/SetManager';
import { AuthProvider } from 'components/AuthProvider';
import './App.css';

function App() {

  return (
    <div className="App" style={{ backgroundColor: 'white' }}>
      <main>
        <AuthProvider>
          <SetManager />
        </AuthProvider>
      </main>
    </div>
  );
}

export default App;
