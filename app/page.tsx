import Link from 'next/link';

export default function Page() {
  return (
    <main>
      <div>
        <h1>Welcome to Bryggan</h1>
        <Link href="/tidningen">Go to app</Link>
        {/* {data.user == null ? <SignIn /> : <Link href="/tidningen">Hey {data.user.name}! Go to app</Link>} */}
      </div>
    </main>
  );
}
