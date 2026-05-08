import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { tokenStorage } from '@/lib/secureStorage';

// Entry point: checks for a stored access token and routes accordingly.
// Does not validate the token — expired tokens are caught on first API call.
export default function Index() {
  const [destination, setDestination] = useState<'/(auth)/login' | '/(tabs)' | null>(null);

  useEffect(() => {
    tokenStorage.getAccessToken().then((token) => {
      setDestination(token ? '/(tabs)' : '/(auth)/login');
    });
  }, []);

  if (!destination) return null;
  return <Redirect href={destination} />;
}
