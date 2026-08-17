
import React, { useEffect } from 'react';
import { Portfolio } from './components/Portfolio';

const initialUrlParams = new URLSearchParams(window.location.search);
const initialDemo = initialUrlParams.get('demo') || undefined;
const initialPage = initialUrlParams.get('page') || undefined;
const initialOrigin = initialUrlParams.get('from') === 'index' ? 'index' : 'referenser';
const parsedReturnY = Number(initialUrlParams.get('returnY'));
const initialReturnY = Number.isFinite(parsedReturnY) && parsedReturnY >= 0
  ? Math.min(Math.floor(parsedReturnY), 2_000_000)
  : undefined;

function App() {
  useEffect(() => {
    if (!initialDemo) window.location.replace('../referenser.html');
  }, []);

  // This bundled app is now only the reference-demo viewer. The VPS site owns
  // every Webbtjänst page and the reference archive itself.
  if (!initialDemo) return null;

  return <Portfolio initialDemo={initialDemo} initialPage={initialPage} initialOrigin={initialOrigin} initialReturnY={initialReturnY} />;

}

export default App;
