export function AutoCompleteCard({
  name,
  onClick,
}: {
  name: string;
  onClick: () => void;
}) {
  return <div className="cursor-pointer my-1 text-sm">{name}</div>;
}
