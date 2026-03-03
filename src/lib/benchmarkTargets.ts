export interface BenchmarkTarget {
  minAge: number;
  maxAge: number;
  targetNetWorthMultiple: number;
  targetSavingsMonths: number;
}

export const benchmarkTargets: BenchmarkTarget[] = [
  { minAge: 20, maxAge: 29, targetNetWorthMultiple: 0.5, targetSavingsMonths: 3 },
  { minAge: 30, maxAge: 34, targetNetWorthMultiple: 1.0, targetSavingsMonths: 4 },
  { minAge: 35, maxAge: 39, targetNetWorthMultiple: 2.0, targetSavingsMonths: 5 },
  { minAge: 40, maxAge: 44, targetNetWorthMultiple: 3.0, targetSavingsMonths: 6 },
  { minAge: 45, maxAge: 49, targetNetWorthMultiple: 4.0, targetSavingsMonths: 6 },
  { minAge: 50, maxAge: 54, targetNetWorthMultiple: 6.0, targetSavingsMonths: 8 },
  { minAge: 55, maxAge: 59, targetNetWorthMultiple: 7.0, targetSavingsMonths: 8 },
  { minAge: 60, maxAge: 67, targetNetWorthMultiple: 8.0, targetSavingsMonths: 10 },
];

export const getBenchmarkTargetForAge = (age: number | null): BenchmarkTarget | null => {
  if (!age || age < 20) return null;
  return (
    benchmarkTargets.find((target) => age >= target.minAge && age <= target.maxAge) ||
    benchmarkTargets[benchmarkTargets.length - 1]
  );
};
