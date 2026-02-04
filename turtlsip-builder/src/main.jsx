import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import Preview from './Preview'

const Main = () => {
  const path = window.location.pathname;
  if (path === '/preview') {
    return <Preview />;
  }
  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
)