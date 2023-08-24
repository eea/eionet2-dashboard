import { useState, useEffect } from 'react';
import { getConfiguration } from '../apiProvider';

export function useConfiguration() {
  const [configuration, setConfiguration] = useState({});

  useEffect(() => {
    async function fetchData() {
      let loadedConfiguration = await getConfiguration();
      if (loadedConfiguration) {
        setConfiguration(loadedConfiguration);
      }
    }
    fetchData();
  }, [getConfiguration]);

  return configuration;
}
