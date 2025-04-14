import React from 'react';
import SetsTable from 'components/SetsTable';
import AddSongComponent from 'components/AddSet'; // Assuming you have an AddSong component
// import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App" style={{ backgroundColor: 'red' }}>
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        <p>
          <SetsTable />
        </p>
        <p>
          <AddSongComponent />
        </p>
      </header>
    </div>
  );
}

export default App;
