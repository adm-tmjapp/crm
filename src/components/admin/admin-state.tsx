export function AdminErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-100">
      {message}
    </div>
  );
}

export function AdminLoadingState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111111] px-5 py-10 text-center text-[#8ea0bd]">
      {label}
    </div>
  );
}

export function AdminEmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111111] px-5 py-10 text-center text-[#8ea0bd]">
      {label}
    </div>
  );
}
