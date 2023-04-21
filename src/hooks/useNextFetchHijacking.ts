import { useEffect } from 'react';

const useNextFetchHijacking = () => {
  useEffect(() => {
    const { fetch: originalFetch } = window;
    window.fetch = async (...args) => {
      const [resource] = args;
      if (typeof resource === 'string' && resource.includes('_next/data')) {
        /* eslint-disable */
        return {
          status: 200,
          statusText: 'OK',
          json: async () => ({ pageProps: {} }),
          text: async () => JSON.stringify({ pageProps: {} }),
          ok: true,
          redirected: false,
          headers: new Headers(),
          type: 'basic',
          url: resource,
        } as any;
        /* eslint-enable */
      }
      const response = await originalFetch(...args);
      return response;
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, []);
};

export default useNextFetchHijacking;
