export function ReviewStateMessage({
  detail,
  title,
}: {
  detail?: string;
  title: string;
}) {
  return (
    <div className="flex h-full items-center justify-center text-center">
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {detail && <p className="mt-2 text-sm text-gray-400">{detail}</p>}
      </div>
    </div>
  );
}
