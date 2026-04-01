interface BarChartProps {
  data: {
    month: string;
    granted: number;
    rejected: number;
    submitted: number;
  }[];
}

export function BarChart({ data }: BarChartProps) {
  const max = Math.max(
    ...data.map((d) => d.granted + d.rejected + d.submitted),
    1,
  );

  return (
    <div className='flex items-end gap-2' style={{ height: 120 }}>
      {data.map((d) => {
        const total = d.granted + d.rejected + d.submitted;
        const pct = (total / max) * 100;

        return (
          <div
            key={d.month}
            className='group flex flex-1 flex-col items-center gap-1'
          >
            <div
              className='relative w-full overflow-hidden rounded-t-md'
              style={{ height: `${Math.max(pct, 4)}%` }}
              title={`${d.month}: ${d.granted} granted, ${d.rejected} rejected, ${d.submitted} submitted`}
            >
              <div className='absolute bottom-0 left-0 right-0 flex flex-col-reverse overflow-hidden rounded-t-md'>
                {d.submitted > 0 && (
                  <div
                    className='w-full bg-blue-200'
                    style={{
                      height: `${(d.submitted / Math.max(total, 1)) * 100}%`,
                      minHeight: 4,
                    }}
                  />
                )}
                {d.rejected > 0 && (
                  <div
                    className='w-full bg-red-400'
                    style={{
                      height: `${(d.rejected / Math.max(total, 1)) * 100}%`,
                      minHeight: 4,
                    }}
                  />
                )}
                {d.granted > 0 && (
                  <div
                    className='w-full bg-emerald-400'
                    style={{
                      height: `${(d.granted / Math.max(total, 1)) * 100}%`,
                      minHeight: 4,
                    }}
                  />
                )}
              </div>
            </div>
            <span className='text-xs text-gray-400'>{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}
