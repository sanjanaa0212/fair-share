export const FontCheck = () => (
  <div className="h-screen w-full p-8">
    {/* Inter font (default) */}
    <div className="text-4xl font-normal mb-4">Inter Medium (Default)</div>
    <div className="text-2xl font-semibold mb-8">Inter SemiBold</div>

    {/* Satoshi fonts */}
    <div className="font-satoshiRegular text-4xl mb-4">Satoshi Regular</div>
    <div className="font-satoshiMedium text-4xl mb-4">Satoshi Medium</div>
    <div className="font-satoshiSemiBold text-4xl mb-4">Satoshi SemiBold</div>
    <div className="font-satoshiBold text-4xl mb-4">Satoshi Bold</div>
  </div>
)
