import { Meh } from 'react-feather';

export type CatchBoundaryProps = {
  caught: any;
};

export function GenericCatchBoundary({ caught }: CatchBoundaryProps) {
  switch (caught.status) {
    case 404:
      return <NotFound caught={caught} />;
    default:
      return <Generic caught={caught} />;
  }
}

function Generic({ caught }: CatchBoundaryProps) {
  return (
    <div>
      <h1>Caught</h1>
      <p>Status: {caught.status}</p>
      <pre>
        <code>{JSON.stringify(caught.data, null, 2)}</code>
      </pre>
    </div>
  );
}

function NotFound({ caught }: CatchBoundaryProps) {
  return (
    <div className="flex h-96 flex-col items-center justify-center gap-2">
      <Meh size={32} />
      <h1 className="text-center text-2xl font-semibold">
        Sorry, sidan
        <br />
        kunde inte hittas
      </h1>
    </div>
  );
}
