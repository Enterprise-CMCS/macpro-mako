import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const queryClient = new QueryClient()

const router = (Element: any) =>
  createBrowserRouter([
    {
      path: '/',
      element: <Element />,
    },
  ])

export const TestWrapper = ({ children }: any) => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router(children)} />
    </QueryClientProvider>
  )
}
