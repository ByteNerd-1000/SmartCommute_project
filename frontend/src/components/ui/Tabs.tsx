// Placeholder for Tab component (can be replaced with a library like Radix UI)
export const Tabs = ({ children, value, onValueChange }: any) => (
  <div>{children}</div>
);

export const TabsList = ({ children }: any) => (
  <div className="flex gap-2 border-b border-slate-700">{children}</div>
);

export const TabsTrigger = ({ children, value, onClick }: any) => (
  <button
    className="px-4 py-2 text-sm font-medium border-b-2 border-transparent hover:border-primary-400 text-slate-400 hover:text-white transition-all"
    onClick={onClick}
  >
    {children}
  </button>
);

export const TabsContent = ({ children }: any) => <div>{children}</div>;
