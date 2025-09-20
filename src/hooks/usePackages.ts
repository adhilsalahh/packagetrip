import { useState, useEffect } from 'react';
import { TrekPackage } from '../types';
import { getTrekPackages, getTrekPackageById } from '../lib/database';

export const usePackages = () => {
  const [packages, setPackages] = useState<TrekPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const data = await getTrekPackages();
        setPackages(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  return { packages, loading, error, refetch: () => fetchPackages() };
};

export const usePackage = (id: string | null) => {
  const [package_, setPackage] = useState<TrekPackage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setPackage(null);
      return;
    }

    const fetchPackage = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTrekPackageById(id);
        setPackage(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [id]);

  return { package: package_, loading, error };
};