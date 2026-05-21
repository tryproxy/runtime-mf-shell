import { cn } from '@/shared/lib/cn';
import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div
      className={cn(
        'flex h-screen flex-col items-center justify-center bg-gray-500'
      )}
    >
      <button
        className="cursor-pointer font-bold text-black"
        onClick={() => setCount(count + 1)}
      >
        [ CENTERED ]
      </button>
      <div>{count}</div>
    </div>
  );
}

export default App;
