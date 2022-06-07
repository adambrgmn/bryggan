import type { LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export default function Issue() {
  let data = useLoaderData();

  return <div>Hello</div>;
}

export let loader: LoaderFunction = async ({ request, params }) => {
  return { params };
};
