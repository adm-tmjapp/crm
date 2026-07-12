export function AdminPageShell({
  title,
  description,
  children
}: Readonly<{
  title: string;
  description: string;
  children: React.ReactNode;
}>) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-bold tracking-[-0.03em] text-white xl:text-[28px]">
          {title}
        </h1>
        <p className="mt-1.5 max-w-3xl text-[14px] text-[#8ea0bd]">{description}</p>
      </div>
      {children}
    </div>
  );
}
