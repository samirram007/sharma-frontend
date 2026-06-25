import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

export default function LayoutAddition() {
  return (<>
    <TanStackRouterDevtools />
    <ReactQueryDevtools buttonPosition="bottom-right" />

  </>)
}
