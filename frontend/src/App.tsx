import React from 'react';
import SetManager from 'components/SetManager';
import AddSetDrawer from 'components/AddSetBar';
// import logo from './logo.svg';
import './App.css';

function App() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="App" style={{ backgroundColor: 'white' }}>
      <main>
        <SetManager />
        <AddSetDrawer open={open} setOpen={setOpen} />
      </main>
    </div>
  );
}

export default App;
