export function TailwindIndicator() {
  if (process.env.NODE_ENV === "production") return null

  return (
    <div className="fixed flex size-6 p-3 bg-gray-800 text-xs text-white rounded-full bottom-1 left-1 z-50 items-center justify-center font-mono">
      <div className="block sm:hidden">xs</div>
      <div className="hidden sm:max-md:block">sm</div>
      <div className="hidden md:max-lg:block">md</div>
      <div className="hidden lg:max-xl:block">lg</div>
      <div className="hidden xl:max-2xl:block">xl</div>
      <div className="hidden 2xl:block">2xl</div>
    </div>
  )
}
