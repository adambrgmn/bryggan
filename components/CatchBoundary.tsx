import { Meh } from 'react-feather';

export type CatchBoundaryProps = {
  caught: Error;
};

export function GenericCatchBoundary({ caught }: CatchBoundaryProps) {
  return (
    <div>
      <h1>Caught</h1>
      <p>Message: {caught.message}</p>
    </div>
  );
}

export function NotFoundBoundary() {
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
