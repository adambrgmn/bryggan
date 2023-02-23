import { Metadata } from 'next';

type Params = { year: string; issue: string };
type Props = { params: Params };

export default async function Issue() {
  return <div />;
}

export function generateMetadata({ params }: Props): Metadata {
  return {
    title: decodeURIComponent([params.year, params.issue].join('-')),
  };
}
