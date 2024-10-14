import { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/users')
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  return (
    <div>
      <h1>Users</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
